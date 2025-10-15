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

    async update (id, data)
    {
        return this.model.findByIdAndUpdate(id, data, { new: true });
    }

    async delete (id)
    {
        return this.model.findByIdAndDelete(id);
    }
}

export default BaseService;