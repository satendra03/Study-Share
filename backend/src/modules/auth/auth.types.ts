import { type User } from "@/modules/user/user.model.js";

export type SignInResult =
    | { status: "existing_user"; user: User }
    | { status: "new_user"; firebaseUid: string; email: string; name: string; photoURL: string };

export type RegisterResult = { user: User };
