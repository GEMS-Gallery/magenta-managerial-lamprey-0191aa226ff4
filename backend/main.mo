import Bool "mo:base/Bool";
import Hash "mo:base/Hash";

import Array "mo:base/Array";
import Int "mo:base/Int";
import Nat "mo:base/Nat";
import Text "mo:base/Text";
import Time "mo:base/Time";
import Result "mo:base/Result";
import HashMap "mo:base/HashMap";
import Iter "mo:base/Iter";

actor {
  type Photo = {
    id: Nat;
    title: Text;
    category: Text;
    imageUrl: Text;
    creator: Text;
    createdAt: Int;
    likes: Nat;
    comments: [Comment];
  };

  type Comment = {
    author: Text;
    content: Text;
    createdAt: Int;
  };

  stable var nextPhotoId: Nat = 0;
  stable var photoEntries: [(Nat, Photo)] = [];

  let photos = HashMap.fromIter<Nat, Photo>(photoEntries.vals(), 0, Nat.equal, Int.hash);

  func generateId() : Nat {
    nextPhotoId += 1;
    nextPhotoId - 1
  };

  public query func getPhotos() : async [Photo] {
    Iter.toArray(photos.vals())
  };

  public query func getPhotosByCategory(category: Text) : async [Photo] {
    Iter.toArray(Iter.filter(photos.vals(), func (photo: Photo) : Bool { photo.category == category }))
  };

  public func addPhoto(title: Text, category: Text, imageUrl: Text, creator: Text) : async Result.Result<Nat, Text> {
    let id = generateId();
    let newPhoto: Photo = {
      id = id;
      title = title;
      category = category;
      imageUrl = imageUrl;
      creator = creator;
      createdAt = Time.now();
      likes = 0;
      comments = [];
    };
    photos.put(id, newPhoto);
    #ok(id)
  };

  public func likePhoto(photoId: Nat) : async Result.Result<(), Text> {
    switch (photos.get(photoId)) {
      case (null) { #err("Photo not found") };
      case (?photo) {
        let updatedPhoto = {
          photo with likes = photo.likes + 1
        };
        photos.put(photoId, updatedPhoto);
        #ok()
      };
    }
  };

  public func addComment(photoId: Nat, author: Text, content: Text) : async Result.Result<(), Text> {
    switch (photos.get(photoId)) {
      case (null) { #err("Photo not found") };
      case (?photo) {
        let newComment: Comment = {
          author = author;
          content = content;
          createdAt = Time.now();
        };
        let updatedPhoto = {
          photo with comments = Array.append(photo.comments, [newComment])
        };
        photos.put(photoId, updatedPhoto);
        #ok()
      };
    }
  };

  system func preupgrade() {
    photoEntries := Iter.toArray(photos.entries());
  };

  system func postupgrade() {
    photoEntries := [];
  };
}
