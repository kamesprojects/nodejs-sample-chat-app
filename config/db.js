import express from "express";
import pgPromise from 'pg-promise';
import { DB_URL } from "./config/env.js";

const pgp = pgPromise();
export const db = pgp(DB_URL);
