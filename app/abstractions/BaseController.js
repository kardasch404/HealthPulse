class BaseController 
{
    handleSuccess(res, data)
    {
        res.json({
            success: true,
            data
        });
    }

    handleError(res, e)
    {
        res.json({
            success: false,
            error: e.message
        });
    }
}

export default BaseController;
