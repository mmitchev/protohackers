import { Server } from "net";



let server = new Server({allowHalfOpen: true});

server.on('connection', (stream) => {
    let buffer: Buffer = Buffer.alloc(256)
    stream.on("data", (buff) => {
        buffer = Buffer.concat([buffer, buff]);
    })
    stream.on("end", () => {
        console.log(buffer.toString("ascii"));
        console.log(stream.closed);
        console.log(JSON.stringify(stream));
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

server.listen(80);