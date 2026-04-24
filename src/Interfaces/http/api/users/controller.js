import autoBind from "auto-bind";
import AddUserUseCase from "../../../../Applications/use_case/users & auth/AddUserUseCase.js";

class UsersController {
  constructor(container) {
    this._container = container;

    autoBind(this);
  }

  async postUserController(req, res, next) {
    try {
      const addUserUseCase = this._container.getInstance(AddUserUseCase.name);
      const addedUser = await addUserUseCase.execute(req.body);

      res.status(201).json({
        status: "success",
        data: {
          addedUser,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

export default UsersController;
