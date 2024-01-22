import util from "util";

const dump = (obj, depth = null) => util.inspect(obj, {depth, colors: true});

export const errorHandler = (error, req, res, next) => {
  // Logging the error here
  console.log(`handler caught an error ${dump(error)}`);
  // Returning the status and error message to client
  res.status(400).send(error.message);
}
export const tryCatch = (controller) => async (req, res, next) => {
  try {
    await controller(req, res);
  } catch (error) {
    return next(error);
  }
};

