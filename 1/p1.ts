import { Server, Socket } from "net";
import { isNumber, isNullOrUndefined } from "util";
import { request } from "http";

let primes = new Set<number>([2,3]);
let maxPrime: number = 2;

//TODO: Sieve up to the number, starting from max prime and going to max
// Webworker?
function sieve(max: number): void {
    
}

async function isPrime(testNum: number): Promise<boolean> {
    //First check if we already know if it's prime
    if (!Number.isInteger(testNum)){
        return false;
    }
    
    if (testNum <= 1) {
        return false;
    }

    if (primes.has(testNum)) {
        return true;
    }

    if(testNum % 2 == 0) {
        return false;
    }

    //Else, brute force it, from 3 to sqrt(testNum), by 2
    //Then add it to the set for later
    for (let i = 3; i < Math.ceil(Math.sqrt(testNum)); i = i + 2) {
        if (testNum % i == 0) {
            return false;
        }
    }
    primes.add(testNum);
    return true;
}

interface Request {
    method: "isPrime",
    number: number,
}

interface Response {
    method: "isPrime",
    prime: boolean
}

function handleRawRequest(socket: Socket, raw: string) {
        let req: Request;
        try {
            req = JSON.parse(raw);
        } catch (ex) {
            //The request is not valid JSON
            socket.write(raw, () => {
                if (raw.includes('nummar')) {
                    console.log(ex);
                }
                console.log(`Invalid JSON: ${raw}`);
                socket.end();
                socket.destroy();
            });
            return;
        }

        if (!req.method || isNullOrUndefined(req.number) || req.method !== 'isPrime' || !isNumber(req.number)) {
            //not a valid request
            socket.write(raw, () => {
                console.log(`Invalid request: ${JSON.stringify(raw)}`);
                socket.end();
                socket.destroy();
            });
            return;
        }

        //request is good
        console.log(`Valid req: ${raw}`);
        
        isPrime(req.number).then((result) => {
            let response: Response = {
                method: "isPrime",
                prime: result,
            }
        
            socket.write(JSON.stringify(response) + '\n');
        })
}

const NL = '\n'.charCodeAt(0);

let server = new Server();

server.on("connection", (socket) => {
    let buffer = Buffer.alloc(0);
    socket.on('data', (data) => {
        //console.log("Log" + data.toString());

        //may be multiple requests one after another, split the buffer based on the newlines
        let raw: string = Buffer.concat([buffer, data]).toString();
        //console.log(raw);
        let isComplete = raw.charAt(raw.length - 1) === '\n';
        //console.log(isComplete)
        let requests = raw.split('\n').filter(s => s !== '');
        //console.log(requests);
        //Clear the buffer if the last data character is a newline, otherwise there's a request still coming
        if (isComplete) {
            buffer = Buffer.alloc(0);
            requests.forEach((req) => {
                handleRawRequest(socket, req);
            });
        } else {
            if (requests.length > 1) {
                requests.slice(0, requests.length - 1).forEach(req => {
                    handleRawRequest(socket, req);
                });
            }

            buffer = Buffer.from(requests[requests.length - 1]);
        }
    }) 
})




server.listen(3000)
