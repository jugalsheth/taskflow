import AuthLayout from "@/components/auth/AuthLayout";
import SignupForm from "@/components/auth/SignupForm";

export default function SignupPage() {
  return (
    <AuthLayout title="TaskFlow - Sign Up">
      <SignupForm />
    </AuthLayout>
  );
} 