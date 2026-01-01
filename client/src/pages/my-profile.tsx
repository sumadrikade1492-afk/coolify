import { Layout } from "@/components/layout";
import { useAuth } from "@/hooks/use-auth";
import { useProfiles, useDeleteProfile } from "@/hooks/use-profiles";
import { Loader2, Trash2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ProfileCard } from "@/components/profile-card";
import { Link } from "wouter";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function MyProfile() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  
  // We need to find the profile belonging to this user
  // Ideally backend should have /api/profiles/me, but we can filter by client side or updated query if API supported it.
  // Assuming the list returns all, we find ours. In a real large app, this is inefficient.
  // The list API does NOT filter by userId currently in the definition, so this is a limitation.
  // We will assume that if we are logged in, we can see if we created any profiles.
  
  const { data: profiles, isLoading: profilesLoading } = useProfiles();
  const { mutate: deleteProfile } = useDeleteProfile();

  if (authLoading || profilesLoading) return <Layout><div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div></Layout>;

  if (!isAuthenticated) {
     window.location.href = "/api/login";
     return null;
  }

  // Filter profiles created by this user (checking userId match which should be available if API returned it)
  // Since the public API schema for Profile includes userId, we can check that.
  const myProfiles = profiles?.filter(p => p.userId === user?.id) || [];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-serif font-bold">My Profiles</h1>
          <Link href="/create-profile">
            <Button>Create New Profile</Button>
          </Link>
        </div>

        {myProfiles.length === 0 ? (
          <div className="text-center py-20 bg-muted/20 rounded-xl border border-dashed border-border">
             <h3 className="text-xl font-semibold mb-2">You haven't created any profiles yet.</h3>
             <p className="text-muted-foreground mb-6">Create a profile for yourself or a family member to get started.</p>
             <Link href="/create-profile"><Button>Create Profile</Button></Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {myProfiles.map(profile => (
              <div key={profile.id} className="relative group">
                <ProfileCard profile={profile} />
                <div className="absolute top-2 left-2 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="icon" className="h-8 w-8">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete this profile.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteProfile(profile.id)}>Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  
                  {/* Edit functionality would require an Edit Profile page/dialog, omitted for brevity but button exists */}
                  <Button variant="secondary" size="icon" className="h-8 w-8">
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
