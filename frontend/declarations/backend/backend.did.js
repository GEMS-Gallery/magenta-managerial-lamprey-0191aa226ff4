export const idlFactory = ({ IDL }) => {
  const Result = IDL.Variant({ 'ok' : IDL.Null, 'err' : IDL.Text });
  const Result_1 = IDL.Variant({ 'ok' : IDL.Nat, 'err' : IDL.Text });
  const Comment = IDL.Record({
    'content' : IDL.Text,
    'createdAt' : IDL.Int,
    'author' : IDL.Text,
  });
  const Photo = IDL.Record({
    'id' : IDL.Nat,
    'title' : IDL.Text,
    'creator' : IDL.Text,
    'createdAt' : IDL.Int,
    'likes' : IDL.Nat,
    'imageUrl' : IDL.Text,
    'category' : IDL.Text,
    'comments' : IDL.Vec(Comment),
  });
  return IDL.Service({
    'addComment' : IDL.Func([IDL.Nat, IDL.Text, IDL.Text], [Result], []),
    'addPhoto' : IDL.Func(
        [IDL.Text, IDL.Text, IDL.Text, IDL.Text],
        [Result_1],
        [],
      ),
    'getPhotos' : IDL.Func([], [IDL.Vec(Photo)], ['query']),
    'likePhoto' : IDL.Func([IDL.Nat], [Result], []),
  });
};
export const init = ({ IDL }) => { return []; };
