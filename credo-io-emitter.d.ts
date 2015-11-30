declare module "@credo/io-emitter" {
	import { RedisClient } from 'redis';
    
	export class Emitter {
		constructor(client: RedisClient, prefix?: string);
		of(nsp: string): Namespace;
	}
	
	export interface Namespace {
		in(room: string): Namespace;
		emit(event: string, data: any);	
	}
}