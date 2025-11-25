import type{type_for_responce  as responce_type } from '../types/index.js'

class api_responce {
    constructor(private status_code: number, private message: string = "Success", private data: any = null) {}

    public send(res: any): void {
        const response: responce_type = {
            success: this.status_code < 400,
            message: this.message,
            data: this.data,
            statuscode: this.status_code
        };
        res.status(this.status_code).json(response);
    }

}

export default api_responce;