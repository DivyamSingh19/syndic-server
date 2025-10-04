import Redis from "ioredis";

const redisSA = new Redis({
    port:6348,
    host: "127.0.0.1"
})
const redisSC = new Redis({
    port:6349
})
export  {redisSA,redisSC}