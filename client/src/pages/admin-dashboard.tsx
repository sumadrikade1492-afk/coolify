import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Users, Edit, Search, Loader2, ShieldCheck, LogOut, CheckCircle, XCircle } from "lucide-react";
import type { Profile } from "@shared/schema";

function getDisplayProfileId(id: number): string {
  return `NRI${14700 + id}`;
}

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const [editForm, setEditForm] = useState<Partial<Profile>>({});

  const { data: adminCheck, isLoading: checkingAdmin } = useQuery({
    queryKey: ["/api/admin/check"],
  });

  const { data: profiles, isLoading: loadingProfiles } = useQuery<Profile[]>({
    queryKey: ["/api/admin/profiles"],
    enabled: !!(adminCheck as any)?.isAdmin,
  });

  useEffect(() => {
    if (!checkingAdmin && !(adminCheck as any)?.isAdmin) {
      setLocation("/admin-login");
    }
  }, [adminCheck, checkingAdmin, setLocation]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: { id: number; updates: Partial<Profile> }) => {
      const response = await apiRequest("PUT", `/api/profiles/${data.id}`, data.updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/profiles"] });
      toast({ title: "Profile Updated", description: "The profile has been updated successfully." });
      setEditingProfile(null);
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to update profile.", variant: "destructive" });
    },
  });

  const handleLogout = async () => {
    await apiRequest("POST", "/api/auth/logout", {});
    setLocation("/admin-login");
  };

  const openEditDialog = (profile: Profile) => {
    setEditingProfile(profile);
    setEditForm({
      firstName: profile.firstName,
      lastName: profile.lastName,
      phoneNumber: profile.phoneNumber,
      gender: profile.gender,
      birthMonth: profile.birthMonth,
      birthYear: profile.birthYear,
      denomination: profile.denomination,
      city: profile.city,
      nativePlace: profile.nativePlace,
      country: profile.country,
      occupation: profile.occupation,
      height: profile.height,
      aboutMe: profile.aboutMe,
      visaType: profile.visaType,
      nativeLanguage: profile.nativeLanguage,
      yearsInUS: profile.yearsInUS,
      partnerPreferences: profile.partnerPreferences,
    });
  };

  const handleUpdateProfile = () => {
    if (editingProfile) {
      updateProfileMutation.mutate({ id: editingProfile.id, updates: editForm });
    }
  };

  if (checkingAdmin) {
    return (
      <Layout>
        <div className="min-h-[80vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!(adminCheck as any)?.isAdmin) {
    return null;
  }

  const filteredProfiles = profiles?.filter((profile) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      profile.firstName?.toLowerCase().includes(searchLower) ||
      profile.lastName?.toLowerCase().includes(searchLower) ||
      profile.phoneNumber?.includes(searchTerm) ||
      getDisplayProfileId(profile.id).toLowerCase().includes(searchLower)
    );
  });

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-serif font-bold">Admin Dashboard</h1>
              <p className="text-muted-foreground text-sm">Manage all profiles</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout} data-testid="button-admin-logout">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              All Profiles ({profiles?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, phone, or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid="input-admin-search"
                />
              </div>
            </div>

            {loadingProfiles ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Gender</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Verified</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProfiles?.map((profile) => (
                      <TableRow key={profile.id} data-testid={`row-profile-${profile.id}`}>
                        <TableCell className="font-medium">{getDisplayProfileId(profile.id)}</TableCell>
                        <TableCell>{profile.firstName} {profile.lastName}</TableCell>
                        <TableCell>{profile.phoneNumber}</TableCell>
                        <TableCell>{profile.gender}</TableCell>
                        <TableCell>{profile.city}, {profile.country}</TableCell>
                        <TableCell>
                          {profile.phoneVerified ? (
                            <Badge className="bg-green-600"><CheckCircle className="w-3 h-3 mr-1" /> Yes</Badge>
                          ) : (
                            <Badge variant="secondary"><XCircle className="w-3 h-3 mr-1" /> No</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openEditDialog(profile)}
                                data-testid={`button-edit-profile-${profile.id}`}
                              >
                                <Edit className="w-4 h-4 mr-1" /> Edit
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Edit Profile - {getDisplayProfileId(profile.id)}</DialogTitle>
                              </DialogHeader>
                              <div className="grid grid-cols-2 gap-4 py-4">
                                <div className="space-y-2">
                                  <Label>First Name</Label>
                                  <Input
                                    value={editForm.firstName || ""}
                                    onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Last Name</Label>
                                  <Input
                                    value={editForm.lastName || ""}
                                    onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Phone</Label>
                                  <Input
                                    value={editForm.phoneNumber || ""}
                                    onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value })}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Gender</Label>
                                  <Select
                                    value={editForm.gender || ""}
                                    onValueChange={(val) => setEditForm({ ...editForm, gender: val })}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="Male">Male</SelectItem>
                                      <SelectItem value="Female">Female</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="space-y-2">
                                  <Label>Denomination</Label>
                                  <Select
                                    value={editForm.denomination || ""}
                                    onValueChange={(val) => setEditForm({ ...editForm, denomination: val })}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="Catholic">Catholic</SelectItem>
                                      <SelectItem value="Pentecostal">Pentecostal</SelectItem>
                                      <SelectItem value="Orthodox">Orthodox</SelectItem>
                                      <SelectItem value="Protestant">Protestant</SelectItem>
                                      <SelectItem value="Jacobite">Jacobite</SelectItem>
                                      <SelectItem value="Marthoma">Marthoma</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="space-y-2">
                                  <Label>City</Label>
                                  <Input
                                    value={editForm.city || ""}
                                    onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Native Place</Label>
                                  <Input
                                    value={editForm.nativePlace || ""}
                                    onChange={(e) => setEditForm({ ...editForm, nativePlace: e.target.value })}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Occupation</Label>
                                  <Input
                                    value={editForm.occupation || ""}
                                    onChange={(e) => setEditForm({ ...editForm, occupation: e.target.value })}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Height</Label>
                                  <Input
                                    value={editForm.height || ""}
                                    onChange={(e) => setEditForm({ ...editForm, height: e.target.value })}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Visa Type</Label>
                                  <Input
                                    value={editForm.visaType || ""}
                                    onChange={(e) => setEditForm({ ...editForm, visaType: e.target.value })}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Native Language</Label>
                                  <Input
                                    value={editForm.nativeLanguage || ""}
                                    onChange={(e) => setEditForm({ ...editForm, nativeLanguage: e.target.value })}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Years in US</Label>
                                  <Input
                                    type="number"
                                    value={editForm.yearsInUS || ""}
                                    onChange={(e) => setEditForm({ ...editForm, yearsInUS: e.target.value ? Number(e.target.value) : null })}
                                  />
                                </div>
                                <div className="space-y-2 col-span-2">
                                  <Label>About Me</Label>
                                  <Textarea
                                    value={editForm.aboutMe || ""}
                                    onChange={(e) => setEditForm({ ...editForm, aboutMe: e.target.value })}
                                    rows={4}
                                  />
                                </div>
                                <div className="space-y-2 col-span-2">
                                  <Label>Partner Preferences</Label>
                                  <Textarea
                                    value={editForm.partnerPreferences || ""}
                                    onChange={(e) => setEditForm({ ...editForm, partnerPreferences: e.target.value })}
                                    rows={4}
                                  />
                                </div>
                              </div>
                              <div className="flex justify-end gap-2">
                                <Button
                                  onClick={handleUpdateProfile}
                                  disabled={updateProfileMutation.isPending}
                                  data-testid="button-save-profile"
                                >
                                  {updateProfileMutation.isPending ? (
                                    <>
                                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                      Saving...
                                    </>
                                  ) : (
                                    "Save Changes"
                                  )}
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
