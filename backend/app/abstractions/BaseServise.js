class BaseService
{
    constructor (model)
    {
        this.model = model;
    }

    async findById (id)
    {
        return this.model.findById(id);
    }
    async create (data)
    {
        const instance = new this.model(data);
        return instance.save();
    }

}

export default BaseService;