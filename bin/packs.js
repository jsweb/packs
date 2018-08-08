#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const class_1 = __importDefault(require("./class"));
const json = path_1.join(process.cwd(), 'package.json');
const pkg = require(json);
const env = process.env.NODE_ENV || 'dev';
const args = process.argv.slice(1).filter((i) => !/packs/.test(i));
const cmd = args.shift() || 'update';
const cli = new class_1.default(env, json, pkg);
cli.exec(cmd, args);
