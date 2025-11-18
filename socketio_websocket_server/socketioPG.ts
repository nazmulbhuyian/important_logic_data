import { Server, Socket } from 'socket.io';
import prisma from '../../../shared/prisma';
import { jwtHelpers } from '../../../helpars/jwtHelpers';
import config from "../../../config";

interface ClientInfo {
  socketId: string;
  role: string;
  driverLat?: number;
  driverLon?: number;
  customerLat?: number;
  customerLon?: number;
}
interface CustomSocket extends Socket {
    user?: any;
}

const clients = new Map<string, ClientInfo>();

export const initializeSocketIO = (server: any) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  // Authentication middleware
  io.use(async (socket: CustomSocket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error('Authentication error'));

      const user = jwtHelpers.verifyToken(token, config.jwt.jwt_secret!);
      if (!user) return next(new Error('Authentication error'));

      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket: CustomSocket) => {
    const user = socket.user;
    if (!user) return socket.disconnect();

    console.log(`User connected: ${user.id}`);

    // Disconnect existing connection if any
    const existingClient = clients.get(user.id);
    if (existingClient) {
      const oldSocket = io.sockets.sockets.get(existingClient.socketId);
      oldSocket?.disconnect();
    }

    // Store new connection
    clients.set(user.id, {
      socketId: socket.id,
      role: user.role,
    });

    // Notify all users about online status
    io.emit('userStatus', { userId: user.id, isOnline: true });

    // Order Tracking Update (Driver)
    socket.on('ORDER_TRACKING_UPDATE', async (data) => {
      try {
        const { orderId, lat, lon } = data;
        if (user.role !== 'DRIVER') {
          return socket.emit('ERROR', { message: 'Driver not authenticated' });
        }

        const order = await prisma.order.findUnique({ where: { id: orderId } });
        if (!order) {
          return socket.emit('ERROR', { message: 'Order not found' });
        }

        // Update driver location
        const client = clients.get(user.id);
        if (client) {
          client.driverLat = lat;
          client.driverLon = lon;
          clients.set(user.id, client);
        }

        // Send update to customer
        const customer = clients.get(order.customerId);
        if (customer) {
          io.to(customer.socketId).emit('ORDER_TRACKING_UPDATE', {
            orderId,
            lat,
            lon,
            userType: 'driver'
          });
        }

        socket.emit('ORDER_TRACKING_UPDATE', { 
          orderId, 
          lat, 
          lon, 
          userType: 'driver' 
        });
      } catch (err) {
        socket.emit('ERROR', { message: 'An error occurred' });
      }
    });

    // Order Tracking Request (Customer)
    socket.on('ORDER_TRACKING_REQUEST', async (data) => {
      try {
        const { orderId } = data;
        if (user.role !== 'CUSTOMER') {
          return socket.emit('ERROR', { message: 'Customer not authenticated' });
        }

        const order = await prisma.order.findUnique({ where: { id: orderId } });
        if (!order) {
          return socket.emit('ERROR', { message: 'Order not found' });
        }

        const driver = clients.get(order.driverId);
        if (driver) {
          socket.emit('ORDER_TRACKING_REQUEST', {
            orderId,
            lat: driver.driverLat,
            lon: driver.driverLon,
            userType: 'customer'
          });
        } else {
          socket.emit('ERROR', { message: 'Driver not found' });
        }
      } catch (err) {
        socket.emit('ERROR', { message: 'An error occurred' });
      }
    });

    // Customer Tracking Update (Customer)
    socket.on('CUSTOMER_TRACKING_UPDATE', async (data) => {
      try {
        const { orderId, lat, lon } = data;
        if (user.role !== 'CUSTOMER') {
          return socket.emit('ERROR', { message: 'Customer not authenticated' });
        }

        const order = await prisma.order.findUnique({ where: { id: orderId } });
        if (!order) {
          return socket.emit('ERROR', { message: 'Order not found' });
        }

        // Update customer location
        const client = clients.get(user.id);
        if (client) {
          client.customerLat = lat;
          client.customerLon = lon;
          clients.set(user.id, client);
        }

        // Send update to driver
        const driver = clients.get(order.driverId);
        if (driver) {
          io.to(driver.socketId).emit('CUSTOMER_TRACKING_UPDATE', {
            orderId,
            lat,
            lon,
            userType: 'customer'
          });
        }

        socket.emit('CUSTOMER_TRACKING_UPDATE', { 
          orderId, 
          lat, 
          lon, 
          userType: 'customer' 
        });
      } catch (err) {
        socket.emit('ERROR', { message: 'An error occurred' });
      }
    });

    // Customer Tracking Request (Driver)
    socket.on('CUSTOMER_TRACKING_REQUEST', async (data) => {
      try {
        const { orderId } = data;
        if (user.role !== 'DRIVER') {
          return socket.emit('ERROR', { message: 'Driver not authenticated' });
        }

        const order = await prisma.order.findUnique({ where: { id: orderId } });
        if (!order) {
          return socket.emit('ERROR', { message: 'Order not found' });
        }

        const customer = clients.get(order.customerId);
        if (customer) {
          socket.emit('CUSTOMER_TRACKING_REQUEST', {
            orderId,
            lat: customer.customerLat,
            lon: customer.customerLon,
            userType: 'driver'
          });
        } else {
          socket.emit('ERROR', { message: 'Customer not found' });
        }
      } catch (err) {
        socket.emit('ERROR', { message: 'An error occurred' });
      }
    });

    // Message Handling
    socket.on('MESSAGE', async (data) => {
      try {
        const { receiverId, message } = data;
        
        // Find or create room
        let room = await prisma.room.findFirst({
          where: {
            OR: [
              { senderId: user.id, receiverId },
              { senderId: receiverId, receiverId: user.id },
            ],
          },
        });

        if (!room) {
          room = await prisma.room.create({
            data: {
              senderId: user.id,
              receiverId,
            },
          });
        }

        // Create message
        const chat = await prisma.message.create({
          data: {
            message,
            senderId: user.id,
            receiverId,
            roomId: room.id,
          },
        });

        // Send to receiver
        const receiver = clients.get(receiverId);
        if (receiver) {
          io.to(receiver.socketId).emit('MESSAGE', chat);
        }

        // Confirm to sender
        socket.emit('MESSAGE', chat);
      } catch (err) {
        socket.emit('ERROR', { message: 'An error occurred' });
      }
    });

    // Fetch Chats
    socket.on('FETCH_CHATS', async (data) => {
      try {
        const { receiverId } = data;
        
        const room = await prisma.room.findFirst({
          where: {
            OR: [
              { senderId: user.id, receiverId },
              { senderId: receiverId, receiverId: user.id },
            ],
          },
        });

        if (!room) {
          return socket.emit('ERROR', { message: 'Room not found' });
        }

        const chats = await prisma.message.findMany({
          where: { roomId: room.id },
          orderBy: { createdAt: 'asc' },
        });

        // Mark messages as read
        await prisma.message.updateMany({
          where: { 
            roomId: room.id,
            receiverId: user.id,
            isRead: false 
          },
          data: { isRead: true },
        });

        socket.emit('FETCH_CHATS', chats);
      } catch (err) {
        socket.emit('ERROR', { message: 'An error occurred' });
      }
    });

    // Unread Messages
    socket.on('UNREAD_MESSAGES', async (data) => {
      try {
        const { receiverId } = data;
        
        const room = await prisma.room.findFirst({
          where: {
            OR: [
              { senderId: user.id, receiverId },
              { senderId: receiverId, receiverId: user.id },
            ],
          },
        });

        if (!room) {
          return socket.emit('ERROR', { message: 'Room not found' });
        }

        const unread = await prisma.message.findMany({
          where: { 
            roomId: room.id,
            receiverId: user.id,
            isRead: false 
          },
        });

        socket.emit('UNREAD_MESSAGES', {
          messages: unread,
          count: unread.length
        });
      } catch (err) {
        socket.emit('ERROR', { message: 'An error occurred' });
      }
    });

    // Message List
    socket.on('MESSAGE_LIST', async () => {
      try {
        const rooms = await prisma.room.findMany({
          where: {
            OR: [
              { senderId: user.id },
              { receiverId: user.id },
            ],
          },
          include: {
            message: {
              orderBy: { createdAt: 'asc' },
              take: 1,
            },
          },
        });

        const userIds = rooms.map(room => 
          room.senderId === user.id ? room.receiverId : room.senderId
        );

        const users = await prisma.user.findMany({
          where: { id: { in: userIds } },
          select: { id: true, fullName: true, email: true, role: true },
        });

        const messageList = rooms.map(room => {
          const otherUserId = room.senderId === user.id 
            ? room.receiverId 
            : room.senderId;
          const userInfo = users.find(u => u.id === otherUserId);
          
          return {
            user: userInfo,
            lastMessage: room.message[0] || null,
          };
        });

        socket.emit('MESSAGE_LIST', messageList);
      } catch (err) {
        socket.emit('ERROR', { message: 'An error occurred' });
      }
    });

    // Disconnect handler
    socket.on('disconnect', () => {
      if (user) {
        const client = clients.get(user.id);
        if (client && client.socketId === socket.id) {
          clients.delete(user.id);
          io.emit('userStatus', { 
            userId: user.id, 
            isOnline: false 
          });
          console.log(`User disconnected: ${user.id}`);
        }
      }
    });
  });

  return io;
};