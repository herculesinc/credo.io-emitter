"use strict";
var msgpack = require('msgpack-js');
var uid2 = require('uid2');
// INTERFACES
// ================================================================================================
// MODULE VARIABLES
// ================================================================================================
var EVENT = 2; // from socket.io-parser
var uid = 'em' + uid2(6);
// EMITTER CLASS
// ================================================================================================
class Emitter {
    constructor(client, prefix) {
        this.client = client;
        this.prefix = prefix || 'socket.io';
        this.namespaces = new Map();
    }
    of(nsp) {
        if (!this.namespaces.has(nsp)) {
            this.namespaces.set(nsp, new Namespace(nsp, this.client, this.prefix));
        }
        return this.namespaces.get(nsp);
    }
}
exports.Emitter = Emitter;
// NAMESPACE CLASS
// ================================================================================================
class Namespace {
    constructor(name, client, prefix) {
        this.name = name;
        this.rooms = [];
        this.client = client;
        this.prefix = prefix;
    }
    in(room) {
        if (this.rooms.indexOf(room) < 0) {
            this.rooms.push(room);
        }
        return this;
    }
    emit(event, data) {
        var packet = { nsp: this.name, type: EVENT, data: [event, data] };
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
exports.Namespace = Namespace;
//# sourceMappingURL=index.js.map