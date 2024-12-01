// Add A Order first my code
export const postOrder: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<IOrderInterface | any> => {
    try {
      const requestData = req.body;
      const {
        payment_type,
        customer_id,
        grand_total_amount,
        payment_transaction_id,
        payment_bank_id,
        received_amount,
        due_amount,
      } = requestData;
  
      const findCustomer = await CustomerModel.findOne({
        _id: customer_id,
      });
      if (!findCustomer) {
        throw new ApiError(400, "Customer Not Found !");
      }
  
      const order_id = await generateOrderId();
      requestData.order_id = order_id;
      const result: IOrderInterface | {} = await postOrderServices(requestData);
      if (result) {
        if (requestData?.first_payment_status == "in-active") {
          // Update the customer status
          const customerUpdateData = {
            first_payment_status: "active",
            customer_status: "active",
          };
          await CustomerModel.updateOne(
            { _id: requestData?.customer_id },
            customerUpdateData,
            {
              runValidators: true,
            }
          );
        }
  
        if (payment_type == "due-payment") {
          if (findCustomer?.previous_due && !findCustomer?.previous_advance) {
            const data = {
              previous_due: findCustomer?.previous_due + grand_total_amount,
            };
            await CustomerModel.updateOne({ _id: customer_id }, data, {
              runValidators: true,
            });
          } else if (
            !findCustomer?.previous_due &&
            findCustomer?.previous_advance
          ) {
            if (findCustomer?.previous_advance > grand_total_amount) {
              const data = {
                previous_advance:
                  findCustomer?.previous_advance - grand_total_amount,
              };
              await CustomerModel.updateOne({ _id: customer_id }, data, {
                runValidators: true,
              });
            } else {
              const due = grand_total_amount - findCustomer?.previous_advance;
              const data = {
                previous_due: findCustomer?.previous_due
                  ? findCustomer?.previous_due + due
                  : due,
                previous_advance: 0,
              };
              await CustomerModel.updateOne({ _id: customer_id }, data, {
                runValidators: true,
              });
            }
          }
          const sendData = {
            customer_due_publisher_id: customer_id,
            customer_due_updated_by: customer_id,
            due_note: "From POS Selling Due Payment",
            due_amount: grand_total_amount,
            customer_id,
            previous_due: findCustomer?.previous_due,
            previous_advance: findCustomer?.previous_advance,
          };
          await postCustomerDueServices(sendData);
        } else if (payment_type == "full-payment") {
          const sendData = {
            customer_payment_publisher_id: customer_id,
            customer_payment_updated_by: customer_id,
            transaction_id: payment_transaction_id,
            payment_note: "From POS Selling Full Payment",
            payment_amount: grand_total_amount,
            customer_id,
            payment_bank_id: payment_bank_id,
            previous_due: findCustomer?.previous_due,
            previous_advance: findCustomer?.previous_advance,
          };
          await postCustomerPaymentServices(sendData);
        } else if (payment_type == "partial-payment") {
          if (received_amount) {
            if (findCustomer?.previous_due) {
              if (findCustomer?.previous_due > received_amount) {
                const data = {
                  previous_due: findCustomer?.previous_due - received_amount,
                };
                await CustomerModel.updateOne({ _id: customer_id }, data, {
                  runValidators: true,
                });
              } else {
                const advance = received_amount - findCustomer?.previous_due;
                const data = {
                  previous_due: 0,
                  previous_advance: findCustomer?.previous_advance
                    ? findCustomer?.previous_advance + advance
                    : advance,
                };
                await CustomerModel.updateOne({ _id: customer_id }, data, {
                  runValidators: true,
                });
              }
            } else {
              const data = {
                previous_due: 0,
                previous_advance: findCustomer?.previous_advance
                  ? findCustomer?.previous_advance + received_amount
                  : received_amount,
              };
              await CustomerModel.updateOne({ _id: customer_id }, data, {
                runValidators: true,
              });
            }
            const sendData = {
              customer_payment_publisher_id: customer_id,
              customer_payment_updated_by: customer_id,
              transaction_id: payment_transaction_id,
              payment_note: "From POS Selling Partial Payment",
              payment_amount: received_amount,
              customer_id,
              payment_bank_id: payment_bank_id,
              previous_due: findCustomer?.previous_due,
              previous_advance: findCustomer?.previous_advance,
            };
            await postCustomerPaymentServices(sendData);
          }
          if (due_amount) {
            if (findCustomer?.previous_due && !findCustomer?.previous_advance) {
              const data = {
                previous_due: findCustomer?.previous_due + due_amount,
              };
              await CustomerModel.updateOne({ _id: customer_id }, data, {
                runValidators: true,
              });
            } else if (
              !findCustomer?.previous_due &&
              findCustomer?.previous_advance
            ) {
              if (findCustomer?.previous_advance > due_amount) {
                const data = {
                  previous_advance: findCustomer?.previous_advance - due_amount,
                };
                await CustomerModel.updateOne({ _id: customer_id }, data, {
                  runValidators: true,
                });
              } else {
                const due = due_amount - findCustomer?.previous_advance;
                const data = {
                  previous_due: findCustomer?.previous_due
                    ? findCustomer?.previous_due + due
                    : due,
                  previous_advance: 0,
                };
                await CustomerModel.updateOne({ _id: customer_id }, data, {
                  runValidators: true,
                });
              }
            }
            const sendData = {
              customer_due_publisher_id: customer_id,
              customer_due_updated_by: customer_id,
              due_note: "From POS Selling Partial Due",
              due_amount: due_amount,
              customer_id,
              previous_due: findCustomer?.previous_due,
              previous_advance: findCustomer?.previous_advance,
            };
            await postCustomerDueServices(sendData);
          }
        } else {
          throw new ApiError(400, "Payment Type Not Found !");
        }
  
        return sendResponse<IOrderInterface>(res, {
          statusCode: httpStatus.OK,
          success: true,
          message: "Order Added Successfully !",
        });
      } else {
        throw new ApiError(400, "Order Added Failed !");
      }
    } catch (error: any) {
      next(error);
    }
  };


//   modify the code using chat gpt
export const postOrder: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const {
        payment_type,
        customer_id,
        grand_total_amount,
        payment_transaction_id,
        payment_bank_id,
        received_amount,
        due_amount,
        first_payment_status,
      } = req.body;
  
      // Validate customer existence
      const findCustomer = await CustomerModel.findById(customer_id);
      if (!findCustomer) {
        throw new ApiError(400, "Customer Not Found!");
      }
  
      // Generate order ID and add to request data
      const order_id = await generateOrderId();
      req.body.order_id = order_id;
  
      // Save order in database
      const result = await postOrderServices(req.body);
      if (!result) {
        throw new ApiError(400, "Order Addition Failed!");
      }
  
      // Update customer status if first payment is inactive
      if (first_payment_status === "in-active") {
        await CustomerModel.updateOne(
          { _id: customer_id },
          {
            first_payment_status: "active",
            customer_status: "active",
          },
          { runValidators: true }
        );
      }
  
      // Handle payment types
      switch (payment_type) {
        case "due-payment":
          await handleDuePayment(
            customer_id,
            grand_total_amount,
            findCustomer
          );
          break;
  
        case "full-payment":
          await handleFullPayment(
            customer_id,
            payment_transaction_id,
            payment_bank_id,
            grand_total_amount,
            findCustomer
          );
          break;
  
        case "partial-payment":
          await handlePartialPayment(
            customer_id,
            payment_transaction_id,
            payment_bank_id,
            received_amount,
            due_amount,
            findCustomer
          );
          break;
  
        default:
          throw new ApiError(400, "Invalid Payment Type!");
      }
  
      // Send response
      return sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Order Added Successfully!",
      });
    } catch (error: any) {
      next(error);
    }
  };
  
  // Helper functions
  const handleDuePayment = async (
    customer_id: string,
    grand_total_amount: number,
    customer: any
  ) => {
    const updatedData = customer?.previous_due
      ? { previous_due: customer.previous_due + grand_total_amount }
      : { previous_due: grand_total_amount };
  
    await CustomerModel.updateOne({ _id: customer_id }, updatedData, {
      runValidators: true,
    });
  
    const sendData = {
      customer_due_publisher_id: customer_id,
      customer_due_updated_by: customer_id,
      due_note: "From POS Selling Due Payment",
      due_amount: grand_total_amount,
      customer_id,
      previous_due: customer.previous_due,
      previous_advance: customer.previous_advance,
    };
  
    await postCustomerDueServices(sendData);
  };
  
  const handleFullPayment = async (
    customer_id: string,
    payment_transaction_id: string,
    payment_bank_id: string,
    payment_amount: number,
    customer: any
  ) => {
    const sendData = {
      customer_payment_publisher_id: customer_id,
      customer_payment_updated_by: customer_id,
      transaction_id: payment_transaction_id,
      payment_note: "From POS Selling Full Payment",
      payment_amount,
      customer_id,
      payment_bank_id,
      previous_due: customer.previous_due,
      previous_advance: customer.previous_advance,
    };
  
    await postCustomerPaymentServices(sendData);
  };
  
  const handlePartialPayment = async (
    customer_id: string,
    payment_transaction_id: string,
    payment_bank_id: string,
    received_amount: number,
    due_amount: number,
    customer: any
  ) => {
    const updateData = { previous_due: 0, previous_advance: 0 };
  
    if (customer?.previous_due) {
      if (customer.previous_due > received_amount) {
        updateData.previous_due = customer.previous_due - received_amount;
      } else {
        const advance = received_amount - customer.previous_due;
        updateData.previous_advance =
          (customer.previous_advance || 0) + advance;
      }
    } else {
      updateData.previous_advance =
        (customer.previous_advance || 0) + received_amount;
    }
  
    await CustomerModel.updateOne({ _id: customer_id }, updateData, {
      runValidators: true,
    });
  
    const sendPaymentData = {
      customer_payment_publisher_id: customer_id,
      customer_payment_updated_by: customer_id,
      transaction_id: payment_transaction_id,
      payment_note: "From POS Selling Partial Payment",
      payment_amount: received_amount,
      customer_id,
      payment_bank_id,
      previous_due: customer.previous_due,
      previous_advance: customer.previous_advance,
    };
  
    await postCustomerPaymentServices(sendPaymentData);
  
    if (due_amount) {
      const sendDueData = {
        customer_due_publisher_id: customer_id,
        customer_due_updated_by: customer_id,
        due_note: "From POS Selling Partial Due",
        due_amount,
        customer_id,
        previous_due: customer.previous_due,
        previous_advance: customer.previous_advance,
      };
  
      await postCustomerDueServices(sendDueData);
    }
  };

  
//   use first code commit roolback
import mongoose, { ClientSession } from "mongoose";
import { Request, Response, NextFunction, RequestHandler } from "express";
import CustomerModel from "./models/CustomerModel"; // Replace with actual path
import ApiError from "./utils/ApiError"; // Replace with actual path
import { sendResponse } from "./utils/responseHandler"; // Replace with actual path
import { postOrderServices, postCustomerDueServices, postCustomerPaymentServices } from "./services"; // Replace with actual path

export const postOrder: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const session: ClientSession = await mongoose.startSession(); // Start a new session
  session.startTransaction(); // Start a transaction
  try {
    const requestData = req.body;
    const {
      payment_type,
      customer_id,
      grand_total_amount,
      payment_transaction_id,
      payment_bank_id,
      received_amount,
      due_amount,
    } = requestData;

    const findCustomer = await CustomerModel.findOne({ _id: customer_id }).session(session);
    if (!findCustomer) {
      throw new ApiError(400, "Customer Not Found !");
    }

    const order_id = await generateOrderId();
    requestData.order_id = order_id;

    const result = await postOrderServices(requestData, session); // Pass session to ensure atomicity
    if (result) {
      if (requestData?.first_payment_status === "in-active") {
        const customerUpdateData = {
          first_payment_status: "active",
          customer_status: "active",
        };
        await CustomerModel.updateOne({ _id: customer_id }, customerUpdateData, { runValidators: true, session });
      }

      if (payment_type === "due-payment") {
        if (findCustomer?.previous_due && !findCustomer?.previous_advance) {
          const data = { previous_due: findCustomer.previous_due + grand_total_amount };
          await CustomerModel.updateOne({ _id: customer_id }, data, { runValidators: true, session });
        } else if (!findCustomer?.previous_due && findCustomer?.previous_advance) {
          if (findCustomer.previous_advance > grand_total_amount) {
            const data = { previous_advance: findCustomer.previous_advance - grand_total_amount };
            await CustomerModel.updateOne({ _id: customer_id }, data, { runValidators: true, session });
          } else {
            const due = grand_total_amount - findCustomer.previous_advance;
            const data = {
              previous_due: findCustomer.previous_due ? findCustomer.previous_due + due : due,
              previous_advance: 0,
            };
            await CustomerModel.updateOne({ _id: customer_id }, data, { runValidators: true, session });
          }
        }

        const sendData = {
          customer_due_publisher_id: customer_id,
          customer_due_updated_by: customer_id,
          due_note: "From POS Selling Due Payment",
          due_amount: grand_total_amount,
          customer_id,
          previous_due: findCustomer?.previous_due,
          previous_advance: findCustomer?.previous_advance,
        };
        await postCustomerDueServices(sendData, session);
      } else if (payment_type === "full-payment") {
        const sendData = {
          customer_payment_publisher_id: customer_id,
          customer_payment_updated_by: customer_id,
          transaction_id: payment_transaction_id,
          payment_note: "From POS Selling Full Payment",
          payment_amount: grand_total_amount,
          customer_id,
          payment_bank_id: payment_bank_id,
          previous_due: findCustomer?.previous_due,
          previous_advance: findCustomer?.previous_advance,
        };
        await postCustomerPaymentServices(sendData, session);
      } else if (payment_type === "partial-payment") {
        if (received_amount) {
          if (findCustomer?.previous_due) {
            if (findCustomer.previous_due > received_amount) {
              const data = { previous_due: findCustomer.previous_due - received_amount };
              await CustomerModel.updateOne({ _id: customer_id }, data, { runValidators: true, session });
            } else {
              const advance = received_amount - findCustomer.previous_due;
              const data = {
                previous_due: 0,
                previous_advance: findCustomer.previous_advance
                  ? findCustomer.previous_advance + advance
                  : advance,
              };
              await CustomerModel.updateOne({ _id: customer_id }, data, { runValidators: true, session });
            }
          } else {
            const data = {
              previous_due: 0,
              previous_advance: findCustomer.previous_advance
                ? findCustomer.previous_advance + received_amount
                : received_amount,
            };
            await CustomerModel.updateOne({ _id: customer_id }, data, { runValidators: true, session });
          }
          const sendData = {
            customer_payment_publisher_id: customer_id,
            customer_payment_updated_by: customer_id,
            transaction_id: payment_transaction_id,
            payment_note: "From POS Selling Partial Payment",
            payment_amount: received_amount,
            customer_id,
            payment_bank_id: payment_bank_id,
            previous_due: findCustomer?.previous_due,
            previous_advance: findCustomer?.previous_advance,
          };
          await postCustomerPaymentServices(sendData, session);
        }
        if (due_amount) {
          if (findCustomer?.previous_due && !findCustomer?.previous_advance) {
            const data = { previous_due: findCustomer.previous_due + due_amount };
            await CustomerModel.updateOne({ _id: customer_id }, data, { runValidators: true, session });
          } else if (!findCustomer?.previous_due && findCustomer?.previous_advance) {
            if (findCustomer.previous_advance > due_amount) {
              const data = { previous_advance: findCustomer.previous_advance - due_amount };
              await CustomerModel.updateOne({ _id: customer_id }, data, { runValidators: true, session });
            } else {
              const due = due_amount - findCustomer.previous_advance;
              const data = {
                previous_due: findCustomer.previous_due ? findCustomer.previous_due + due : due,
                previous_advance: 0,
              };
              await CustomerModel.updateOne({ _id: customer_id }, data, { runValidators: true, session });
            }
          }
          const sendData = {
            customer_due_publisher_id: customer_id,
            customer_due_updated_by: customer_id,
            due_note: "From POS Selling Partial Due",
            due_amount: due_amount,
            customer_id,
            previous_due: findCustomer?.previous_due,
            previous_advance: findCustomer?.previous_advance,
          };
          await postCustomerDueServices(sendData, session);
        }
      } else {
        throw new ApiError(400, "Payment Type Not Found !");
      }

      await session.commitTransaction(); // Commit all changes
      session.endSession();
      return sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Order Added Successfully!",
      });
    } else {
      throw new ApiError(400, "Order Added Failed!");
    }
  } catch (error) {
    await session.abortTransaction(); // Rollback all changes
    session.endSession();
    next(error);
  }
};


// modify this code with small changes
import mongoose from "mongoose";
import { Request, Response, NextFunction, RequestHandler } from "express";
import CustomerModel from "../models/CustomerModel"; // Adjust import based on your structure
import ApiError from "../utils/ApiError";
import sendResponse from "../utils/sendResponse";
import {
  postOrderServices,
  postCustomerDueServices,
  postCustomerPaymentServices,
  generateOrderId,
} from "../services"; // Adjust import based on your structure

export const postOrder: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      payment_type,
      customer_id,
      grand_total_amount,
      payment_transaction_id,
      payment_bank_id,
      received_amount,
      due_amount,
      first_payment_status,
    } = req.body;

    // Validate customer existence
    const findCustomer = await CustomerModel.findById(customer_id).session(
      session
    );
    if (!findCustomer) {
      throw new ApiError(400, "Customer Not Found!");
    }

    // Generate order ID and add to request data
    const order_id = await generateOrderId();
    req.body.order_id = order_id;

    // Save order in database
    const result = await postOrderServices(req.body, session);
    if (!result) {
      throw new ApiError(400, "Order Addition Failed!");
    }

    // Update customer status if first payment is inactive
    if (first_payment_status === "in-active") {
      await CustomerModel.updateOne(
        { _id: customer_id },
        {
          first_payment_status: "active",
          customer_status: "active",
        },
        { session, runValidators: true }
      );
    }

    // Handle payment types
    switch (payment_type) {
      case "due-payment":
        await handleDuePayment(
          customer_id,
          grand_total_amount,
          findCustomer,
          session
        );
        break;

      case "full-payment":
        await handleFullPayment(
          customer_id,
          payment_transaction_id,
          payment_bank_id,
          grand_total_amount,
          findCustomer,
          session
        );
        break;

      case "partial-payment":
        await handlePartialPayment(
          customer_id,
          payment_transaction_id,
          payment_bank_id,
          received_amount,
          due_amount,
          findCustomer,
          session
        );
        break;

      default:
        throw new ApiError(400, "Invalid Payment Type!");
    }

    // Commit transaction
    await session.commitTransaction();
    session.endSession();

    // Send response
    return sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Order Added Successfully!",
    });
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
};

// Helper functions
const handleDuePayment = async (
  customer_id: string,
  grand_total_amount: number,
  customer: any,
  session: mongoose.ClientSession
) => {
  const updatedData = customer?.previous_due
    ? { previous_due: customer.previous_due + grand_total_amount }
    : { previous_due: grand_total_amount };

  await CustomerModel.updateOne({ _id: customer_id }, updatedData, {
    session,
    runValidators: true,
  });

  const sendData = {
    customer_due_publisher_id: customer_id,
    customer_due_updated_by: customer_id,
    due_note: "From POS Selling Due Payment",
    due_amount: grand_total_amount,
    customer_id,
    previous_due: customer.previous_due,
    previous_advance: customer.previous_advance,
  };

  await postCustomerDueServices(sendData, session);
};

const handleFullPayment = async (
  customer_id: string,
  payment_transaction_id: string,
  payment_bank_id: string,
  payment_amount: number,
  customer: any,
  session: mongoose.ClientSession
) => {
  const sendData = {
    customer_payment_publisher_id: customer_id,
    customer_payment_updated_by: customer_id,
    transaction_id: payment_transaction_id,
    payment_note: "From POS Selling Full Payment",
    payment_amount,
    customer_id,
    payment_bank_id,
    previous_due: customer.previous_due,
    previous_advance: customer.previous_advance,
  };

  await postCustomerPaymentServices(sendData, session);
};

const handlePartialPayment = async (
  customer_id: string,
  payment_transaction_id: string,
  payment_bank_id: string,
  received_amount: number,
  due_amount: number,
  customer: any,
  session: mongoose.ClientSession
) => {
  const updateData = { previous_due: 0, previous_advance: 0 };

  if (customer?.previous_due) {
    if (customer.previous_due > received_amount) {
      updateData.previous_due = customer.previous_due - received_amount;
    } else {
      const advance = received_amount - customer.previous_due;
      updateData.previous_advance =
        (customer.previous_advance || 0) + advance;
    }
  } else {
    updateData.previous_advance =
      (customer.previous_advance || 0) + received_amount;
  }

  await CustomerModel.updateOne({ _id: customer_id }, updateData, {
    session,
    runValidators: true,
  });

  const sendPaymentData = {
    customer_payment_publisher_id: customer_id,
    customer_payment_updated_by: customer_id,
    transaction_id: payment_transaction_id,
    payment_note: "From POS Selling Partial Payment",
    payment_amount: received_amount,
    customer_id,
    payment_bank_id,
    previous_due: customer.previous_due,
    previous_advance: customer.previous_advance,
  };

  await postCustomerPaymentServices(sendPaymentData, session);

  if (due_amount) {
    const sendDueData = {
      customer_due_publisher_id: customer_id,
      customer_due_updated_by: customer_id,
      due_note: "From POS Selling Partial Due",
      due_amount,
      customer_id,
      previous_due: customer.previous_due,
      previous_advance: customer.previous_advance,
    };

    await postCustomerDueServices(sendDueData, session);
  }
};
