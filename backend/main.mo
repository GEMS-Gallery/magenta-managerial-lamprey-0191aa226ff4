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
import Principal "mo:base/Principal";
import Debug "mo:base/Debug";

actor {
  type Photo = {
    id: Nat;
    title: Text;
    category: Text;
    imageUrl: Text;
    creator: Principal;
    createdAt: Int;
    likes: Nat;
    likedBy: [Principal];
    comments: [Comment];
  };

  type Comment = {
    author: Principal;
    content: Text;
    createdAt: Int;
  };

  type UserProfile = {
    principal: Principal;
    profilePicture: ?Text;
  };

  stable var nextPhotoId: Nat = 0;
  stable var photoEntries: [(Nat, Photo)] = [];
  stable var userProfileEntries: [(Principal, UserProfile)] = [];

  let photos = HashMap.fromIter<Nat, Photo>(photoEntries.vals(), 0, Nat.equal, Int.hash);
  let userProfiles = HashMap.fromIter<Principal, UserProfile>(userProfileEntries.vals(), 10, Principal.equal, Principal.hash);

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

  public shared(msg) func addPhoto(title: Text, category: Text, imageUrl: Text) : async Result.Result<Nat, Text> {
    let id = generateId();
    let newPhoto: Photo = {
      id = id;
      title = title;
      category = category;
      imageUrl = imageUrl;
      creator = msg.caller;
      createdAt = Time.now();
      likes = 0;
      likedBy = [];
      comments = [];
    };
    photos.put(id, newPhoto);
    #ok(id)
  };

  public shared(msg) func likePhoto(photoId: Nat) : async Result.Result<(), Text> {
    switch (photos.get(photoId)) {
      case (null) { #err("Photo not found") };
      case (?photo) {
        if (Array.find<Principal>(photo.likedBy, func(p) { p == msg.caller }) != null) {
          #err("You have already liked this photo")
        } else {
          let updatedPhoto = {
            photo with
            likes = photo.likes + 1;
            likedBy = Array.append(photo.likedBy, [msg.caller]);
          };
          photos.put(photoId, updatedPhoto);
          #ok()
        }
      };
    }
  };

  public query(msg) func hasLikedPhoto(photoId: Nat) : async Bool {
    switch (photos.get(photoId)) {
      case (null) { false };
      case (?photo) {
        Array.find<Principal>(photo.likedBy, func(p) { p == msg.caller }) != null
      };
    }
  };

  public shared(msg) func addComment(photoId: Nat, content: Text) : async Result.Result<(), Text> {
    switch (photos.get(photoId)) {
      case (null) { #err("Photo not found") };
      case (?photo) {
        let newComment: Comment = {
          author = msg.caller;
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

  public shared(msg) func removePhoto(photoId: Nat) : async Result.Result<(), Text> {
    switch (photos.get(photoId)) {
      case (null) { #err("Photo not found") };
      case (?photo) {
        if (photo.creator != msg.caller) {
          #err("Only the creator can remove this photo")
        } else {
          ignore photos.remove(photoId);
          #ok()
        }
      };
    }
  };

  public shared(msg) func setProfilePicture(imageUrl: Text) : async Result.Result<(), Text> {
    Debug.print("Setting profile picture for principal: " # Principal.toText(msg.caller));
    let profile = switch (userProfiles.get(msg.caller)) {
      case (null) {
        {
          principal = msg.caller;
          profilePicture = ?imageUrl;
        }
      };
      case (?existingProfile) {
        {
          existingProfile with profilePicture = ?imageUrl
        }
      };
    };
    userProfiles.put(msg.caller, profile);
    #ok()
  };

  public query(msg) func getProfilePicture() : async ?Text {
    Debug.print("Getting profile picture for principal: " # Principal.toText(msg.caller));
    switch (userProfiles.get(msg.caller)) {
      case (null) { null };
      case (?profile) { profile.profilePicture };
    }
  };

  system func preupgrade() {
    photoEntries := Iter.toArray(photos.entries());
    userProfileEntries := Iter.toArray(userProfiles.entries());
  };

  system func postupgrade() {
    photoEntries := [];
    userProfileEntries := [];
    nextPhotoId := 0;
  };
}
