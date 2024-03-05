class Register {
    constructor() {
        this.val = 0x00;
    }

    read() {
        return this.val;
    }

    write(val) {

        this.val = val;
        if (this.val > 255) {

            //a carried happened!

        }
    }
}