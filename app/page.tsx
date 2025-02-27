import { Button } from "@/components/ui/button";
import {
  RegisterLink,
  LoginLink,
  LogoutLink,
} from "@kinde-oss/kinde-auth-nextjs/components";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export default async function Home() {
  const { getUser } =  getKindeServerSession();
  const session = await getUser();

  return (
    <div className="p-10">
      <h1>Welcome to the app</h1>
      {session ? (
        <LogoutLink> <Button>Logout</Button></LogoutLink>
      ) : (
        <>
          <RegisterLink> <Button>Register</Button></RegisterLink>
          <LoginLink> <Button>Login</Button></LoginLink>
        </>
      )}
    </div>
  );
}
