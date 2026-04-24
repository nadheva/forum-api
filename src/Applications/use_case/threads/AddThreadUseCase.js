import DomainErrorTranslator from "../../../Commons/exceptions/DomainErrorTranslator.js";
import NewThread from "../../../Domains/threads/entities/NewThread.js";

class AddThreadUseCase {
  constructor(threadRepository) {
    this._threadRepository = threadRepository;
  }

  async execute(userId, useCasePayload) {
    try {
      const newThread = new NewThread(useCasePayload);

      return await this._threadRepository.addThread(userId, newThread);
    } catch (error) {
      const getError = DomainErrorTranslator.translate(error);
      throw getError;
    }
  }
}

export default AddThreadUseCase;
