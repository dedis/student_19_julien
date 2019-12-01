import deePool from 'deepool'
import GfP from './gfp';
import { zeroBI } from '../constants';
import GfP2 from './gfp2';
import GfP12 from './gfp12';
import GfP6 from './gfp6';

export const GfPPool1 = deePool.create(function makeGFP12(){
        return new GfP()
})

export const GfPPool2 = deePool.create(function makeGFP12(){
        return new GfP2(new GfP(), new GfP())
})

export const GfPPool6 = deePool.create(function makeGFP12(){
        return new GfP6()
})

export const GfPPool12 = deePool.create(function makeGFP12(){
        return new GfP12()
})