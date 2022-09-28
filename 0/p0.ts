import { Server } from "net";



let server = new Server({allowHalfOpen: true});

server.on('connection', (stream) => {
    let buffer: Buffer = Buffer.alloc(0);
    stream.on("data", (buff) => {
        console.log(`Receiving: ${buff.toString("hex")}\n`);
        buffer = Buffer.concat([buffer, buff]);
    })
    stream.on("end", () => {
        console.log("Writing:" + buffer.toString("hex"));
        if (!stream.closed) {
            try {
                stream.write(buffer, (err?) => {
                    if (err)
                        console.log("error writing to stream");
                });
                stream.end();
            } catch (err) {
                console.log("error writing to stream");
            }

        }
        stream.destroy();
    })
})

server.listen(3000);
