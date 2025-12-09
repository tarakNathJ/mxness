class ring_buffer {
    private size: number =0;
    private buffer: any[];
    private write_index: number = 0;
    private read_index: number = 0;;

    constructor(size: number) {
      this.size = size;
      this.buffer = new Array(size);
    }

    
    public ring_publish(value: any) {
      this.buffer[this.write_index] = value;
      this.write_index = (this.write_index + 1) % this.size;
    }

    public ring_consumer (){
        if( this.read_index === this.write_index) return null;
        const value = this.buffer[this.read_index];
        this.read_index = (this.read_index + 1) % this.size;
        return value;
    }
}

export {ring_buffer}