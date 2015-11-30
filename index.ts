"use strict";
// IMPORTS
// ================================================================================================
import * as redis from 'redis';
import * as msgpack from 'msgpack-js';
import * as uid2 from 'uid2';

// INTERFACES
// ================================================================================================


// MODULE VARIABLES
// ================================================================================================
var EVENT = 2; // from socket.io-parser
var uid = 'em' + uid2(6);

// EMITTER CLASS
// ================================================================================================
export class Emitter {
	
	client: redis.RedisClient;
	prefix: string;
	namespaces: Map<string, Namespace>;
	
	constructor(client: redis.RedisClient, prefix?: string) {
		this.client = client;
		this.prefix = prefix || 'socket.io';
		this.namespaces = new Map<string,Namespace>();
	}
	
	of(nsp: string) {
		if (!this.namespaces.has(nsp)) {
			this.namespaces.set(nsp, new Namespace(nsp, this.client, this.prefix));
		}
		return this.namespaces.get(nsp);
	}
}

// NAMESPACE CLASS
// ================================================================================================
export class Namespace {
	name	: string;
	rooms	: string[];
	client	: redis.RedisClient;
	prefix	: string;	
	
	constructor(name: string, client: redis.RedisClient, prefix: string) {
		this.name = name;
		this.rooms = [];
		this.client = client;
		this.prefix = prefix;
	}
	
	in(room: string): Namespace {
		if (this.rooms.indexOf(room) < 0) {
			this.rooms.push(room);
		}
		return this;
	}
	
	emit(event: string, data: any) {
			
		var packet = { nsp: this.name, type: EVENT,	data: [event, data] };
		var channel = `${this.prefix}#${packet.nsp}#`;
		var message = msgpack.encode([uid, packet, { rooms: this.rooms }]);
		
		if (this.rooms.length > 0) {
			this.rooms.forEach((room) => {
				var roomChannel = channel + room + '#';
				this.client.publish(roomChannel, message);
			});
		}
		else {
			this.client.publish(channel, message);
		}
		
		this.rooms = [];
	}
}