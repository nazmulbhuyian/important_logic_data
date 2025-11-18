import WebSocket, { WebSocketServer } from 'ws';

interface ExtendedWebSocket extends WebSocket {
  userId?: string;
  driverLat?: number;
  driverLon?: number;
  customarLat?: number;
  customarLon?: number;
}
import prisma from '../../../shared/prisma';  // Prisma to access DB
import { jwtHelpers } from '../../../helpars/jwtHelpers';
import config from "../../../config";

const onlineUsers = new Set<string>();
const userSockets = new Map<string, ExtendedWebSocket>();
const clients = new Map<string, { ws: ExtendedWebSocket, userId: string, role: string }>();
export const initializeWebSocket = (server: any) => {
  const wss = new WebSocket.Server({ server });

  wss.on('connection', (ws) => {
    console.log('WebSocket connected');

    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());

        if (data.event === 'authenticate') {
            const token = data.token;

            if (!token) {
            ws.close();
            return;
            }

            try {
            const user = jwtHelpers.verifyToken(token, config.jwt.jwt_secret!);

            if (!user) {
              ws.close();
              return;
            }

            const { id } = user;

            (ws as ExtendedWebSocket).userId = id;
            onlineUsers.add(id);
            userSockets.set(id, ws);
            clients.set(id, { ws, userId: id, role: user.role });

            ws.send(JSON.stringify({ type: 'AUTH_SUCCESS', message: 'Authenticated successfully', userId: id, role: user.role }));

            // Broadcast user status to all clients
            wss.clients.forEach(client => {
              if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({
                event: 'userStatus',
                data: { userId: id, isOnline: true },
              }));
              }
            });
            } catch (err) {
            ws.close();
            }

        } else if (data.event === 'USER_LOCATION_UPDATE') {
          const { lat, lon } = data;
          
          const client = (ws as ExtendedWebSocket).userId && clients.get((ws as ExtendedWebSocket).userId!);
          if (!client) {
            ws.send(JSON.stringify({ type: 'ERROR', message: 'User not authenticated' }));
            return;
          }
          
          if (client.role === 'CUSTOMER') {
            client.ws.customarLat = lat;
            client.ws.customarLon = lon;
          } else if (client.role === 'DRIVER') {
            client.ws.driverLat = lat;
            client.ws.driverLon = lon;
          }

          
          ws.send(JSON.stringify({
            event: 'USER_LOCATION_UPDATE',
            lat,
            lon,
            userType: client.role
          }));
        } else if (data.event === 'USER_TRACKING_REQUEST') {
          const client = (ws as ExtendedWebSocket).userId && clients.get((ws as ExtendedWebSocket).userId!);
          if (!client) {
              ws.send(JSON.stringify({ type: 'ERROR', message: 'User not authenticated' }));
              return;
          }
          
          // Extract optional parameters with default values
          const { foodCategories = [], maxDistance } = data;
          
          // Get client's current location
          let clientLat: number, clientLon: number;
          if (client.role === 'CUSTOMER') {
              clientLat = client.ws.customarLat ?? (await prisma.user.findUnique({ where: { id: client.userId }, select: { lat: true } }))?.lat!;
              clientLon = client.ws.customarLon ?? (await prisma.user.findUnique({ where: { id: client.userId }, select: { lon: true } }))?.lon!;
          } else {
              clientLat = client.ws.driverLat ?? (await prisma.user.findUnique({ where: { id: client.userId }, select: { lat: true } }))?.lat!;
              clientLon = client.ws.driverLon ?? (await prisma.user.findUnique({ where: { id: client.userId }, select: { lon: true } }))?.lon!;
          }
          
          if (typeof clientLat !== 'number' || typeof clientLon !== 'number') {
              ws.send(JSON.stringify({ type: 'ERROR', message: 'Your location is not available' }));
              return;
          }
          
          const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
              const toRad = (value: number) => value * Math.PI / 180;
              const R = 6371;
              const dLat = toRad(lat2 - lat1);
              const dLon = toRad(lon2 - lon1);
              const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
                  Math.sin(dLon / 2) * Math.sin(dLon / 2);
              const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
              return R * c;
          };
          
          let usersToTrack: any[] = [];
          
          if (client.role === 'CUSTOMER') {
              // First find the food category IDs that match the requested titles
              let categoryIds: string[] = [];
              if (foodCategories.length > 0) {
                  const matchingCategories = await prisma.foodCategory.findMany({
                      where: {
                          title: { in: foodCategories },
                          status: 'ACTIVE'
                      },
                      select: { id: true }
                  });
                  categoryIds = matchingCategories.map(c => c.id);
                  
                  // If no matching categories found, return empty array
                  if (categoryIds.length === 0) {
                      ws.send(JSON.stringify({
                          event: 'USER_TRACKING_RESPONSE',
                          data: {
                              userType: 'CUSTOMER',
                              filters: { foodCategories, maxDistance },
                              locations: []
                          }
                      }));
                      return;
                  }
              }
              
              // Build the base query for drivers
              let driverQuery: any = {
                  where: {
                      role: 'DRIVER',
                      status: 'ACTIVE'
                  },
                  select: { 
                      id: true, 
                      lat: true, 
                      lon: true,
                      startingRate: true,
                      fullName: true,
                      profileImage: true,
                      email: true,
                      avgRating: true
                  }
              };
              
              // If food categories are specified, only include drivers with menus in those categories
              if (categoryIds.length > 0) {
                  driverQuery.where.menus = {
                      some: {
                          foodCategoryId: { in: categoryIds },
                          status: 'ACTIVE',
                          isDeleted: false
                      }
                  };
              }
              
              // Get all matching drivers
              const dbDrivers = await prisma.user.findMany(driverQuery);
              
              // Get latest locations with online priority
              const driversWithLocations = await Promise.all(dbDrivers.map(async dbDriver => {
                  const onlineDriver = clients.get(dbDriver.id);
                  const lat = onlineDriver?.ws.driverLat ?? dbDriver.lat!;
                  const lon = onlineDriver?.ws.driverLon ?? dbDriver.lon!;
          
                  if (typeof lat !== 'number' || typeof lon !== 'number') return null;
          
                  return {
                      ...dbDriver,
                      lat,
                      lon,
                      isOnline: onlineUsers.has(dbDriver.id)
                  };
              }));
          
              const validDrivers = driversWithLocations.filter(Boolean);
              
              // Now process the filtered drivers with distance calculation
              usersToTrack = validDrivers.map(driver => {
                  const distance = calculateDistance(clientLat, clientLon, driver!.lat, driver!.lon);
                  
                  // Apply max distance filter if specified
                  if (maxDistance !== undefined && distance > maxDistance) return null;
                  
                  return {
                      userId: driver!.id,
                      role: 'DRIVER',
                      fullName: driver!.fullName,
                      profileImage: driver!.profileImage,
                      email: driver!.email,
                      avgRating: driver!.avgRating,
                      startingRate: driver!.startingRate || 0,
                      lat: driver!.lat,
                      lon: driver!.lon,
                      distance,
                      isOnline: driver!.isOnline
                  };
              });
          }else if (client.role === 'DRIVER') {
            // Get all customers from database
            const dbCustomers = await prisma.user.findMany({
              where: {
                role: 'CUSTOMER',
              },
              select: { id: true, lat: true, lon: true }
            });
        
            // Get latest locations with online priority
            const customersWithLocations = await Promise.all(dbCustomers.map(async dbCustomer => {
              const onlineCustomer = clients.get(dbCustomer.id);
              const lat = onlineCustomer?.ws.customarLat ?? dbCustomer.lat!;
              const lon = onlineCustomer?.ws.customarLon ?? dbCustomer.lon!;
        
              if (typeof lat !== 'number' || typeof lon !== 'number') return null;
        
              return {
                userId: dbCustomer.id,
                lat,
                lon,
                isOnline: onlineUsers.has(dbCustomer.id) // Check online status from onlineUsers set
              };
            }));
        
            const validCustomers = customersWithLocations.filter(Boolean);
        
            // Process customers
            usersToTrack = await Promise.all(validCustomers.map(async customer => {
              const distance = calculateDistance(clientLat, clientLon, customer!.lat, customer!.lon);
        
              const userData = await prisma.user.findUnique({
                where: { id: customer!.userId },
                select: { 
                  role: true,
                  fullName: true,
                  profileImage: true,
                  email: true,
                  avgRating: true,
                  startingRate: true
                }
              });
        
              return {
                userId: customer!.userId,
                ...userData,
                startingRate: userData?.startingRate || 0,
                lat: customer!.lat,
                lon: customer!.lon,
                distance,
                isOnline: customer!.isOnline
              };
            }));
          }
        
          // Final processing
          usersToTrack = usersToTrack
            .filter(Boolean)
            .sort((a, b) => a.distance - b.distance)
            .map(user => ({
              ...user,
              distance: Number(user.distance.toFixed(2))
            }));
        
          ws.send(JSON.stringify({
            event: 'USER_TRACKING_RESPONSE',
            data: {
              userType: client.role,
              filters: client.role === 'CUSTOMER' ? { maxDistance, foodCategories } : {},
              locations: usersToTrack
            }
          }));
        } else if (data.event === 'ORDER_TRACKING_UPDATE' ) {
          const { orderId, lat, lon } = data;

            // Check if driver is authenticated
            const client = (ws as ExtendedWebSocket).userId && clients.get((ws as ExtendedWebSocket).userId!);
            if (client && client.role !== 'DRIVER') {
              ws.send(JSON.stringify({ type: 'ERROR', message: 'Driver not authenticated' }));
              return;
            }
            if (!client) {
            ws.send(JSON.stringify({ type: 'ERROR', message: 'Driver not authenticated' }));
            return;
            }

          // Validate order existence
          const order = await prisma.order.findUnique({
            where: { id: orderId },
          });

          if (!order) {
            ws.send(JSON.stringify({ type: 'ERROR', message: 'Order not found' }));
            return;
          }

          // Update driver's location
          client.ws.driverLat = lat;
          client.ws.driverLon = lon;

          // Broadcast location update
          ws.send(JSON.stringify({
            event: 'ORDER_TRACKING_UPDATE',
            orderId,
            lat,
            lon,
            userType: 'driver'
          }));

        } else if (data.event === 'ORDER_TRACKING_REQUEST') {
          const { orderId } = data;
        
          // Authentication check
          const client = (ws as ExtendedWebSocket).userId && clients.get((ws as ExtendedWebSocket).userId!);
          if (!client || (client.role !== 'CUSTOMER' && client.role !== 'DRIVER')) {
            ws.send(JSON.stringify({ type: 'ERROR', message: 'User not authenticated' }));
            return;
          }
        
          try {
            // Validate order existence
            const order = await prisma.order.findUnique({
              where: { id: orderId },
              include: {
                driver: { select: { lat: true, lon: true } },
                customer: { select: { lat: true, lon: true } }
              }
            });
        
            if (!order) {
              ws.send(JSON.stringify({ type: 'ERROR', message: 'Order not found' }));
              return;
            }
        
            // Get participant data
            const [driverData, customerData] = await Promise.all([
              prisma.user.findUnique({
                where: { id: order.driverId },
                select: {
                  id: true,
                  role: true,
                  fullName: true,
                  profileImage: true,
                  email: true,
                  avgRating: true,
                  startingRate: true
                }
              }),
              prisma.user.findUnique({
                where: { id: order.customerId },
                select: {
                  id: true,
                  role: true,
                  fullName: true,
                  profileImage: true,
                  email: true,
                  avgRating: true,
                  startingRate: true
                }
              })
            ]);
        
            if (!driverData || !customerData) {
              ws.send(JSON.stringify({ type: 'ERROR', message: 'Participant data missing' }));
              return;
            }
        
            // Get real-time locations from WebSocket connections
            const onlineDriver = clients.get(order.driverId);
            const onlineCustomer = clients.get(order.customerId);
        
            // Prioritize WebSocket locations, fallback to database locations
            const driverLocation = {
              lat: onlineDriver?.ws.driverLat ?? order.driver.lat,
              lon: onlineDriver?.ws.driverLon ?? order.driver.lon
            };
        
            const customerLocation = {
              lat: onlineCustomer?.ws.customarLat ?? order.customer.lat, // Fixed typo
              lon: onlineCustomer?.ws.customarLon ?? order.customer.lon  // Fixed typo
            };
        
            // Validate locations
            if (!driverLocation.lat || !driverLocation.lon || 
                !customerLocation.lat || !customerLocation.lon) {
              ws.send(JSON.stringify({ type: 'ERROR', message: 'Location data unavailable' }));
              return;
            }
        
            // Prepare response
            const response = {
              event: 'ORDER_TRACKING_REQUEST',
              orderId,
              locations: [
                {
                  ...driverData,
                  startingRate: driverData.startingRate || 0,
                  ...driverLocation,
                  isOnline: !!onlineDriver
                },
                {
                  ...customerData,
                  startingRate: customerData.startingRate || 0,
                  ...customerLocation,
                  isOnline: !!onlineCustomer
                }
              ]
            };
        
            ws.send(JSON.stringify(response));
          } catch (error) {
            console.error('Order tracking error:', error);
            ws.send(JSON.stringify({ 
              type: 'ERROR', 
              message: 'Failed to retrieve tracking information' 
            }));
          }
        } else if (data.event === 'CUSTOMER_TRACKING_UPDATE') {
          const { orderId, lat, lon } = data;

          // Check if customer is authenticated
          const client = (ws as ExtendedWebSocket).userId && clients.get((ws as ExtendedWebSocket).userId!);
            if (client && client.role !== 'CUSTOMER') {
              ws.send(JSON.stringify({ type: 'ERROR', message: 'Customer not authenticated' }));
              return;
            }
          if (!client) {
            ws.send(JSON.stringify({ type: 'ERROR', message: 'Customer not authenticated' }));
            return;
          }

          // Validate order existence
          const order = await prisma.order.findUnique({
            where: { id: orderId },
          });

          if (!order) {
            ws.send(JSON.stringify({ type: 'ERROR', message: 'Order not found' }));
            return;
          }


          // Update customer's location
          client.ws.customarLat = lat;
          client.ws.customarLon = lon;

          // Broadcast customer location update
          ws.send(JSON.stringify({
            event: 'CUSTOMER_TRACKING_UPDATE',
            orderId,
            lat,
            lon,
            userType: 'customer'
          }));

        } else if (data.event === 'CUSTOMER_TRACKING_REQUEST' ) {
          const { orderId } = data;

          // Check if driver is authenticated
          const client = (ws as ExtendedWebSocket).userId && clients.get((ws as ExtendedWebSocket).userId!);
            if (client && client.role !== 'DRIVER') {
              ws.send(JSON.stringify({ type: 'ERROR', message: 'Driver not authenticated' }));
              return;
            }
          if (!client) {
            ws.send(JSON.stringify({ type: 'ERROR', message: 'Driver not authenticated' }));
            return;
          }

          // Validate order existence
          const order = await prisma.order.findUnique({
            where: { id: orderId },
          });

          if (!order) {
            ws.send(JSON.stringify({ type: 'ERROR', message: 'Order not found' }));
            return;
          }

            // Send customer tracking request to the driver
            const customer = clients.get(order.customerId);
            if (customer) {
            ws.send(JSON.stringify({
              event: 'CUSTOMER_TRACKING_REQUEST',
              orderId,
              lat: customer.ws.customarLat || (await prisma.user.findUnique({ where: { id: customer.userId }, select: { lat: true } }))?.lat,
              lon: customer.ws.customarLon || (await prisma.user.findUnique({ where: { id: customer.userId }, select: { lon: true } }))?.lon,
              userType: 'driver'
            }));
            } else {
            ws.send(JSON.stringify({ type: 'ERROR', message: 'Customer not found' }));
            }
        } else if (data.event === 'MESSAGE' ){
          const { receiverId, message } = data;
          
          // Check if user is authenticated
          const client = (ws as ExtendedWebSocket).userId && clients.get((ws as ExtendedWebSocket).userId!);
            if (!client) {
              ws.send(JSON.stringify({ type: 'ERROR', message: 'User not authenticated' }));
              return;
            }

          // // Validate receiver
          // const receiverClient = clients.get(receiverId);
          // if (!receiverClient) {
          //   ws.send(JSON.stringify({ type: 'ERROR', message: 'Receiver not found' }));
          //   return;
          // }

          let room = await prisma.room.findFirst({
            where: {
              OR: [
                { senderId: client.userId, receiverId: receiverId },
                { senderId: receiverId, receiverId: client.userId },
              ],
            },
          });

          if (!room) {
            room = await prisma.room.create({
              data: {
                senderId: client.userId,
                receiverId: receiverId,
              },
            });
          }

          const chat = await prisma.message.create({
            data: {
              message,
              senderId: client.userId,
              receiverId,
              roomId: room.id,
            },
          });

          // Send message to receiver
          const receiverWs = userSockets.get(receiverId);
          if (receiverWs) {
          receiverWs.send(JSON.stringify({ event: 'MESSAGE', data: chat})
        )
          };
          ws.send(JSON.stringify({ event: 'MESSAGE', data: chat}));
        } else if (data.event === 'MESSAGE_TO_ADMIN') {
          try {
              // Find admin user
              const admin = await prisma.user.findFirst({
                  where: { role: 'ADMIN', email: 'admin@gmail.com' },
                  select: { id: true }
              });
      
              if (!admin) {
                  ws.send(JSON.stringify({ type: 'ERROR', message: 'No admin user found' }));
                  return;
              }
      
              const { message } = data;
              const senderId = (ws as ExtendedWebSocket).userId;
      
              // Check if sender is authenticated
              if (!senderId) {
                  ws.send(JSON.stringify({ type: 'ERROR', message: 'User not authenticated' }));
                  return;
              }
      
              // Find or create room between sender and admin
              let room = await prisma.room.findFirst({
                  where: {
                      OR: [
                          { senderId, receiverId: admin.id },
                          { senderId: admin.id, receiverId: senderId },
                      ],
                  },
              });
      
              if (!room) {
                  room = await prisma.room.create({
                      data: {
                          senderId,
                          receiverId: admin.id,
                      },
                  });
              }
      
              // Create message record
              const chat = await prisma.message.create({
                  data: {
                      message,
                      senderId,
                      receiverId: admin.id,
                      roomId: room.id,
                  },
                  include: {
                      sender: { select: { id: true, fullName: true, profileImage: true } }, // Include sender details if needed
                      receiver: { select: { id: true, fullName: true, profileImage: true  } }, // Include receiver details if needed
                  },
              });
      
              // Send message to admin if online
              const adminWs = userSockets.get(admin.id);
              if (adminWs) {
                  adminWs.send(JSON.stringify({ 
                      event: 'MESSAGE', 
                      data: chat 
                  }));
              }
      
              // Send confirmation to sender
              ws.send(JSON.stringify({ 
                  event: 'MESSAGE_SENT', 
                  data: chat 
              }));
      
          } catch (error) {
              console.error('Error processing MESSAGE_TO_ADMIN:', error);
              ws.send(JSON.stringify({ 
                  type: 'ERROR', 
                  message: 'Internal server error' 
              }));
          }
      } else if (data.event === 'FETCH_CHATS' ) {
          const { receiverId } = data;
          // Check if user is authenticated
          const client = (ws as ExtendedWebSocket).userId && clients.get((ws as ExtendedWebSocket).userId!);
            if (!client) {
              ws.send(JSON.stringify({ type: 'ERROR', message: 'User not authenticated' }));
              return;
            }

          const room = await prisma.room.findFirst({
            where: {
              OR: [
                { senderId: client.userId, receiverId },
                { senderId: receiverId, receiverId: client.userId },
              ],
            },
          });

          if (!room) {
            ws.send(JSON.stringify({ type: 'FETCH_CHATS', data: [] }));
            return;
          }

          const chats = await prisma.message.findMany({
            where: { roomId: room.id},
            orderBy: { createdAt: 'asc' },
          });

          await prisma.message.updateMany({
            where: { roomId: room.id },
            data: { isRead: true },
          });

          ws.send(JSON.stringify({
            event: 'FETCH_CHATS',
            data: chats,
          }));

        } else if (data.event === 'UNREAD_MESSAGES' ) {
          const { receiverId } = data;
          // Check if user is authenticated
          const client = (ws as ExtendedWebSocket).userId && clients.get((ws as ExtendedWebSocket).userId!);
            if (!client) {
              ws.send(JSON.stringify({ type: 'ERROR', message: 'User not authenticated' }));
              return;
            }

            const room = await prisma.room.findFirst({
              where: {
                OR: [
                  { senderId: client.userId, receiverId },
                  { senderId: receiverId, receiverId: client.userId },
                ],
              },
            });

            if (!room) {
              ws.send(JSON.stringify({ type: 'ERROR', message: 'Room not found' }));
              return;
            }

            const unReadMessages = await prisma.message.findMany({
              where: { roomId: room.id, receiverId: client.userId, isRead: false },
            });

            const count = unReadMessages.length;

            ws.send(JSON.stringify({
              event: 'UNREAD_MESSAGES',
              data: { message: unReadMessages, count: count},
            }));
        } else if (data.event === 'MESSAGE_LIST' ) {
          try {
            const rooms = await prisma.room.findMany({
              where: {
                OR: [
                  { senderId: (ws as ExtendedWebSocket).userId },
                  { receiverId: (ws as ExtendedWebSocket).userId },
                ],
              },
              include: {
                message: {
                  orderBy: { createdAt: 'desc' },
                  take: 1,
                },
              },
            });

            const userIds = rooms.map(room => {
              return room.senderId === (ws as ExtendedWebSocket).userId
                ? room.receiverId
                : room.senderId;
            });

            const userInfos = await prisma.user.findMany({
              where: {
                id: {
                  in: userIds.filter((id): id is string => id !== undefined),
                },
              },
              select: {
                id: true,
                profileImage: true,
                fullName: true,
                email: true,
                role: true,
              },
            });

            //combine user info with their last message
            const userwithLastMessage = rooms.map((room) => {
              const otherUserId = room.senderId === (ws as ExtendedWebSocket).userId ? room.receiverId : room.senderId;
              const userInfo = userInfos.find((userInfo) => userInfo.id === otherUserId);

              return {
                user: userInfo || null,
                lastMessage: room.message[0] || null,
              };
            });

            ws.send(JSON.stringify({
              event: 'MESSAGE_LIST',
              data: userwithLastMessage,
            }));
          } catch (err) {
            console.error('Error fetching message list: ', err);
            ws.send(JSON.stringify({ type: 'ERROR', message: 'An error occurred' }));
          }

        } else if (data.event === 'FETCH_ALL_DRIVER_ONLINE_OFFLINE') {
          try {
            // Check if the user is authenticated and is an admin
            const client = (ws as ExtendedWebSocket).userId && clients.get((ws as ExtendedWebSocket).userId!);
            if (!client || client.role !== 'ADMIN') {
              ws.send(JSON.stringify({ type: 'ERROR', message: 'Unauthorized access' }));
              return;
            }
        
            // Fetch all drivers from the database
            const allDrivers = await prisma.user.findMany({
              where: { role: 'DRIVER', isDeleted: false },
              select: {
                id: true,
                fullName: true,
                profileImage: true,
                email: true,
                isAllowed: true,
                lat: true,
                lon: true,
                createdAt: true,
              },
            });
        
            // Determine online status and location for each driver
            const driversWithStatus = allDrivers.map(driver => {
              const isOnline = onlineUsers.has(driver.id);
        
              // If driver is online, use WebSocket location; otherwise, use database location
              const lat = isOnline ? clients.get(driver.id)?.ws.driverLat : driver.lat;
              const lon = isOnline ? clients.get(driver.id)?.ws.driverLon : driver.lon;
        
              return {
                ...driver,
                lat,
                lon,
                isOnline,
                userType: 'ADMIN',
              };
            });
        
            // Send the response back to the admin
            ws.send(JSON.stringify({
              event: 'FETCH_ALL_DRIVER_ONLINE_OFFLINE',
              data: driversWithStatus,
            }));
          } catch (err) {
            console.error('Error fetching driver status: ', err);
            ws.send(JSON.stringify({ type: 'ERROR', message: 'An error occurred while fetching driver status' }));
          }
        } else if (data.event === 'UPDATE_ONLINE_OFFLINE') {
          const { isOnline } = data;
        
          // Check if user is authenticated
          const client = (ws as ExtendedWebSocket).userId && clients.get((ws as ExtendedWebSocket).userId!);
          if (!client) {
            ws.send(JSON.stringify({ type: 'ERROR', message: 'User not authenticated' }));
            return;
          }
        
          const userId = client.userId;
        
          try {
            if (isOnline === false) {
              // User is going offline - save their last known location
              const { role, ws: clientWs } = client;
              const lat = role === 'DRIVER' ? clientWs.driverLat : clientWs.customarLat;
              const lon = role === 'DRIVER' ? clientWs.driverLon : clientWs.customarLon;
        
              // Update database if coordinates exist
              if (lat !== undefined && lon !== undefined) {
                await prisma.user.update({
                  where: { id: userId },
                  data: { lat, lon },
                });
              }
        
              // Remove user from online set
              onlineUsers.delete(userId);
            } else {
              // User is coming online
              onlineUsers.add(userId);
            }
        
            // Broadcast status change to all clients
            broadcastToAll(wss, {
              event: 'userStatus',
              data: { userId, isOnline },
            });
        
            // Send success response to the user
            ws.send(
              JSON.stringify({
                event: 'UPDATE_ONLINE_OFFLINE_SUCCESS',
                message: `Status updated to ${isOnline ? 'online' : 'offline'}`,
              })
            );
          } catch (err) {
            console.error('Error updating online status:', err);
            ws.send(
              JSON.stringify({
                type: 'ERROR',
                message: 'Failed to update online status',
              })
            );
          }
        } else {
          ws.send(JSON.stringify({ type: 'ERROR', message: 'Unknown event type' }));
        }
      } catch (err) {
        console.error('Error handling message: ', err);
        ws.send(JSON.stringify({ type: 'ERROR', message: 'An error occurred' }));
      }
    });

    ws.on('close', async () => {
      const extendedWs = ws as ExtendedWebSocket;
      if (extendedWs.userId) {
        const userId = extendedWs.userId;
        const client = clients.get(userId);
    
        // Save location data before cleanup
        if (client) {
          const { role, ws } = client;
          let lat: number | undefined, lon: number | undefined;
    
          if (role === 'DRIVER') {
            lat = ws.driverLat;
            lon = ws.driverLon;
          } else if (role === 'CUSTOMER') {
            lat = ws.customarLat; // Note: Typo preserved from original code
            lon = ws.customarLon; // Note: Typo preserved from original code
          }
    
          // Update database if coordinates exist
          if (lat !== undefined && lon !== undefined) {
            try {
              await prisma.user.update({
                where: { id: userId },
                data: { lat, lon },
              });
              console.log(`Updated location for user ${userId}`);
            } catch (error) {
              console.error('Failed to update user location:', error);
            }
          }
        }
    
        // Cleanup operations
        onlineUsers.delete(userId);
        userSockets.delete(userId);
        clients.delete(userId);
    
        // Broadcast user offline status
        broadcastToAll(wss, {
          event: 'userStatus',
          data: { userId: userId, isOnline: false },
        });
      }
    });
  });
};


function broadcastToAll(wss: WebSocketServer, message: object) {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
}