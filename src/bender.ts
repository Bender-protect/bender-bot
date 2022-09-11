import dotenv from 'dotenv';
import { BenderClient } from './structures/Bender';
dotenv.config();

export const Bender = new BenderClient()
Bender.start();