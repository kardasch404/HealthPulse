import BaseController from '../abstractions/BaseController.js';



class TerminController extends BaseController
{
    /** @type {TerminService} */
    #terminService;

    /**
     * @param {TerminService} terminService
     */
    constructor (terminService)
    {
        super();
        this.#terminService = terminService ;
    }

    async createTermin (req, res)
    {
        try
        {
            const termin = await this.#terminService.create(req.body);