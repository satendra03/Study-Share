"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { BookOpen, GraduationCap, Briefcase } from "lucide-react";

type Role = "student" | "teacher" | null;

export default function CompleteProfilePage() {
  const [role, setRole] = useState<Role>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { setAppUser } = useAuth();

  // Student form state
  const [studentForm, setStudentForm] = useState({
    fullName: "", semester: "", branch: "", collegeId: "", enrollmentNumber: ""
  });

  // Teacher form state
  const [teacherForm, setTeacherForm] = useState({
    fullName: "", teacherId: ""
  });

  const getIdToken = () => {
    return sessionStorage.getItem("pendingIdToken");
  };

  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const idToken = getIdToken();
    if (!idToken) { setError("Session expired. Please sign in again."); return; }
    setLoading(true);
    try {
      const res = await api.post("/auth/register/student", {
        idToken,
        ...studentForm,
        semester: Number(studentForm.semester),
      });
      setAppUser(res.data.data);
      sessionStorage.removeItem("pendingIdToken");
      sessionStorage.removeItem("pendingUser");
      router.push("/dashboard");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleTeacherSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const idToken = getIdToken();
    if (!idToken) { setError("Session expired. Please sign in again."); return; }
    setLoading(true);
    try {
      const res = await api.post("/auth/register/teacher", { idToken, ...teacherForm });
      setAppUser(res.data.data);
      sessionStorage.removeItem("pendingIdToken");
      sessionStorage.removeItem("pendingUser");
      router.push("/dashboard");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <Card className="w-full max-w-lg bg-gray-900 border-gray-800 text-white">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2"><BookOpen className="text-indigo-400 w-8 h-8" /></div>
          <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
          <p className="text-gray-400 text-sm mt-1">Tell us who you are to get started</p>
        </CardHeader>
        <CardContent>
          {error && <p className="text-red-400 text-sm mb-4 bg-red-950 px-3 py-2 rounded">{error}</p>}

          {!role && (
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => setRole("student")}
                className="flex flex-col items-center gap-3 p-6 border-2 border-gray-700 hover:border-indigo-500 rounded-xl transition-all">
                <GraduationCap className="w-10 h-10 text-indigo-400" />
                <span className="font-semibold text-white">Student</span>
                <span className="text-gray-400 text-xs text-center">Browse and download study materials</span>
              </button>
              <button onClick={() => setRole("teacher")}
                className="flex flex-col items-center gap-3 p-6 border-2 border-gray-700 hover:border-indigo-500 rounded-xl transition-all">
                <Briefcase className="w-10 h-10 text-indigo-400" />
                <span className="font-semibold text-white">Teacher</span>
                <span className="text-gray-400 text-xs text-center">Upload and share learning materials</span>
              </button>
            </div>
          )}

          {role === "student" && (
            <form onSubmit={handleStudentSubmit} className="space-y-4">
              <button type="button" onClick={() => setRole(null)} className="text-sm text-indigo-400 hover:underline mb-2">← Change role</button>
              {[
                { label: "Full Name", key: "fullName", placeholder: "Your full name" },
                { label: "Enrollment Number", key: "enrollmentNumber", placeholder: "e.g. 0101CS221234" },
                { label: "Branch", key: "branch", placeholder: "e.g. Computer Science" },
                { label: "Semester", key: "semester", placeholder: "e.g. 4", type: "number" },
                { label: "College ID / Name", key: "collegeId", placeholder: "Your college" },
              ].map(({ label, key, placeholder, type }) => (
                <div key={key}>
                  <Label className="text-gray-300">{label}</Label>
                  <Input
                    className="bg-gray-800 border-gray-700 text-white mt-1"
                    placeholder={placeholder}
                    type={type || "text"}
                    value={(studentForm as Record<string, string>)[key]}
                    onChange={e => setStudentForm(prev => ({ ...prev, [key]: e.target.value }))}
                    required
                  />
                </div>
              ))}
              <Button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700">
                {loading ? "Saving..." : "Complete Profile"}
              </Button>
            </form>
          )}

          {role === "teacher" && (
            <form onSubmit={handleTeacherSubmit} className="space-y-4">
              <button type="button" onClick={() => setRole(null)} className="text-sm text-indigo-400 hover:underline mb-2">← Change role</button>
              {[
                { label: "Full Name", key: "fullName", placeholder: "Your full name" },
                { label: "Teacher ID", key: "teacherId", placeholder: "Your staff/employee ID" },
              ].map(({ label, key, placeholder }) => (
                <div key={key}>
                  <Label className="text-gray-300">{label}</Label>
                  <Input
                    className="bg-gray-800 border-gray-700 text-white mt-1"
                    placeholder={placeholder}
                    value={(teacherForm as Record<string, string>)[key]}
                    onChange={e => setTeacherForm(prev => ({ ...prev, [key]: e.target.value }))}
                    required
                  />
                </div>
              ))}
              <Button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700">
                {loading ? "Saving..." : "Complete Profile"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
