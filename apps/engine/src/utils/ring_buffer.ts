class ring_buffer {
    private size: number =0;
    private buffer: any[];
    private writeIndex: number = 0;
    private readIndex: number = 0;;

    constructor(size: number) {
      this.size = size;
      this.buffer = new Array(size);
    }

    
    public ring_publish(value: any) {
      this.buffer[this.writeIndex] = value;
      this.writeIndex = (this.writeIndex + 1) % this.size;
    }

    public ring_consumer (){
        if( this.readIndex === this.writeIndex) return null;
        const value = this.buffer[this.readIndex];
        this.readIndex = (this.readIndex + 1) % this.size;
        return value;
    }
}

export {ring_buffer}