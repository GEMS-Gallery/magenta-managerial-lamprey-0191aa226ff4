import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface Comment {
  'content' : string,
  'createdAt' : bigint,
  'author' : Principal,
}
export interface Photo {
  'id' : bigint,
  'title' : string,
  'creator' : Principal,
  'createdAt' : bigint,
  'likes' : bigint,
  'imageUrl' : string,
  'category' : string,
  'comments' : Array<Comment>,
}
export type Result = { 'ok' : null } |
  { 'err' : string };
export type Result_1 = { 'ok' : bigint } |
  { 'err' : string };
export interface _SERVICE {
  'addComment' : ActorMethod<[bigint, string], Result>,
  'addPhoto' : ActorMethod<[string, string, string], Result_1>,
  'getPhotos' : ActorMethod<[], Array<Photo>>,
  'getPhotosByCategory' : ActorMethod<[string], Array<Photo>>,
  'likePhoto' : ActorMethod<[bigint], Result>,
  'removePhoto' : ActorMethod<[bigint], Result>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
