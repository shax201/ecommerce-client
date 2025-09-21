"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Save,
  Plus,
  Trash2,
  Link,
  Mail,
  Phone,
  MapPin,
  Loader2,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import {
  FooterService,
  type FooterFormData,
  type ContactInfoFormData,
  type FooterSectionFormData,
  type FooterLinkFormData,
  type ContentResponse,
} from "@/lib/services/content-service";
import { useFooterManagementISR } from "@/hooks/use-footer-management-isr";
import { useFooterRedux } from "@/hooks/use-footer-redux";
import { handleFooterUpdate } from "@/actions/revalidate";

// Types for the component
interface FooterLink {
  id: string;
  _id?: string; // MongoDB ID
  title: string;
  url: string;
  isExternal: boolean;
  isActive: boolean;
  order: number;
}

interface FooterSection {
  id: string;
  _id?: string; // MongoDB ID
  title: string;
  links: FooterLink[];
  isActive: boolean;
  order: number;
  createdAt?: string;
  updatedAt?: string;
}

interface ContactInfo {
  email: string;
  phone: string;
  address: string;
  socialMedia: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    github?: string;
  };
}

interface FooterData {
  id?: string;
  _id?: string; // MongoDB ID
  sections: FooterSection[];
  contactInfo: ContactInfo;
  copyright: string;
  description: string;
  logoUrl: string;
  logoAlt: string;
  createdAt?: string;
  updatedAt?: string;
}

interface FooterManagementProps {
  footerData?: any;
}

export function FooterManagement({
  footerData: initialFooterData,
}: FooterManagementProps) {
  // Use Redux for footer management
  const {
    footer: reduxFooter,
    loading: reduxLoading,
    updating: reduxUpdating,
    deleting: reduxDeleting,
    error: reduxError,
    updateError: reduxUpdateError,
    deleteError: reduxDeleteError,
    isGeneralModalOpen,
    isContactModalOpen,
    isSectionModalOpen,
    isLinkModalOpen,
    isDeleteModalOpen,
    editingSection,
    editingLink,
    deletingItem,
    updateGeneralInfo: updateGeneralInfoRedux,
    updateContactInfo: updateContactInfoRedux,
    addSection: addSectionRedux,
    updateSection: updateSectionRedux,
    deleteSection: deleteSectionRedux,
    addLink: addLinkRedux,
    updateLink: updateLinkRedux,
    deleteLink: deleteLinkRedux,
    openGeneralModal,
    closeGeneralModal,
    openContactModal,
    closeContactModal,
    openSectionModal,
    closeSectionModal,
    openLinkModal,
    closeLinkModal,
    openDeleteModal,
    closeDeleteModal,
    refreshFooter,
    clearAllErrors,
  } = useFooterRedux({ autoFetch: true });

  // Use the custom ISR hook for better data management (fallback)
  const {
    footer: isrFooter,
    loading: isLoading,
    error: isrError,
    dataSource,
    performanceMetrics,
    refresh,
    loadFooter,
  } = useFooterManagementISR({ footerData: initialFooterData });

  const [footerData, setFooterData] = useState<FooterData | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(!initialFooterData && !isrFooter && !reduxFooter);

  // Modal states
  const [sectionModal, setSectionModal] = useState<{
    isOpen: boolean;
    section: any;
    isEditing: boolean;
  }>({
    isOpen: false,
    section: null,
    isEditing: false,
  });

  const [linkModal, setLinkModal] = useState<{
    isOpen: boolean;
    link: any;
    sectionId?: string;
    isEditing: boolean;
  }>({
    isOpen: false,
    link: null,
    sectionId: undefined,
    isEditing: false,
  });

  const [contactModal, setContactModal] = useState<{
    isOpen: boolean;
  }>({
    isOpen: false,
  });

  const [generalModal, setGeneralModal] = useState<{
    isOpen: boolean;
  }>({
    isOpen: false,
  });

  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{
    isOpen: boolean;
    type: "section" | "link" | null;
    item: any;
    sectionId?: string;
  }>({
    isOpen: false,
    type: null,
    item: null,
  });

  // Load footer data on component mount
  useEffect(() => {
    if (!initialFooterData && !isrFooter && !reduxFooter && !footerData) {
      loadFooterData();
    }
  }, []); // Run only on mount

  // Update footer data when Redux data changes (priority)
  useEffect(() => {
    if (reduxFooter && !footerData) {
      // Use Redux data if available (highest priority)
      const footer = reduxFooter as any; // Type assertion for Redux data
      setFooterData({
        id: footer._id || footer.id,
        _id: footer._id,
        sections:
          footer.sections?.map((section: any) => ({
            id: section._id || section.id,
            _id: section._id,
            title: section.title,
            links:
              section.links?.map((link: any) => ({
                id: link._id || link.id,
                _id: link._id,
                title: link.title,
                url: link.url,
                isExternal: link.isExternal,
                isActive: link.isActive,
                order: link.order,
              })) || [],
            isActive: section.isActive,
            order: section.order,
            createdAt: section.createdAt,
            updatedAt: section.updatedAt,
          })) || [],
        contactInfo: footer.contactInfo,
        copyright: footer.copyright,
        description: footer.description,
        logoUrl: footer.logoUrl,
        logoAlt: footer.logoAlt,
        createdAt: footer.createdAt,
        updatedAt: footer.updatedAt,
      });
    }
  }, [reduxFooter, footerData]);

  // Update footer data when ISR data changes (fallback)
  useEffect(() => {
    if (isrFooter && !reduxFooter && !footerData) {
      // Use ISR data if available
      const footer = isrFooter as any; // Type assertion for ISR data
      setFooterData({
        id: footer._id || footer.id,
        _id: footer._id,
        sections:
          footer.sections?.map((section: any) => ({
            id: section._id || section.id,
            _id: section._id,
            title: section.title,
            links:
              section.links?.map((link: any) => ({
                id: link._id || link.id,
                _id: link._id,
                title: link.title,
                url: link.url,
                isExternal: link.isExternal,
                isActive: link.isActive,
                order: link.order,
              })) || [],
            isActive: section.isActive,
            order: section.order,
            createdAt: section.createdAt,
            updatedAt: section.updatedAt,
          })) || [],
        contactInfo: footer.contactInfo,
        copyright: footer.copyright,
        description: footer.description,
        logoUrl: footer.logoUrl,
        logoAlt: footer.logoAlt,
        createdAt: footer.createdAt,
        updatedAt: footer.updatedAt,
      });
    }
  }, [isrFooter, reduxFooter, footerData]);

  // Debug logging (only in development)
  if (process.env.NODE_ENV === "development") {
    console.log("🔍 FooterManagement Redux Debug:", {
      reduxLoading,
      reduxUpdating,
      reduxDeleting,
      reduxError,
      reduxUpdateError,
      reduxDeleteError,
      hasReduxFooter: !!reduxFooter,
      hasFooterData: !!footerData,
      sectionsCount: footerData?.sections?.length || 0,
      isGeneralModalOpen,
      isContactModalOpen,
    });
  }

  const loadFooterData = async () => {
    try {
      setIsInitialLoading(true);
      const response = await FooterService.get();
      if (response.success && response.data) {
        const footer = response.data as any; // Type assertion for API data
        setFooterData({
          id: footer._id || footer.id,
          _id: footer._id,
          sections:
            footer.sections?.map((section: any) => ({
              id: section._id || section.id,
              _id: section._id,
              title: section.title,
              links:
                section.links?.map((link: any) => ({
                  id: link._id || link.id,
                  _id: link._id,
                  title: link.title,
                  url: link.url,
                  isExternal: link.isExternal,
                  isActive: link.isActive,
                  order: link.order,
                })) || [],
              isActive: section.isActive,
              order: section.order,
              createdAt: section.createdAt,
              updatedAt: section.updatedAt,
            })) || [],
          contactInfo: footer.contactInfo || {
            email: "",
            phone: "",
            address: "",
            socialMedia: {},
          },
          copyright: footer.copyright || "",
          description: footer.description || "",
          logoUrl: footer.logoUrl || "",
          logoAlt: footer.logoAlt || "",
          createdAt: footer.createdAt,
          updatedAt: footer.updatedAt,
        });
      } else {
        toast.error(response.message || "Failed to load footer data");
      }
    } catch (error) {
      console.error("Error loading footer data:", error);
      toast.error("Failed to load footer data");
    } finally {
      setIsInitialLoading(false);
    }
  };

  const handleSaveSection = async (sectionData: FooterSectionFormData) => {
    try {
      let response: ContentResponse;

      if (sectionModal.isEditing) {
        // Update existing section
        response = await FooterService.updateSection(
          sectionModal.section.id,
          sectionData
        );
        if (response.success) {
          toast.success("Footer section updated successfully");
          setSectionModal({ isOpen: false, section: null, isEditing: false });
          await loadFooterData(); // Reload data

          // Trigger ISR cache revalidation
          await handleFooterUpdate();
        } else {
          console.error("Footer section update error:", response);
          toast.error(response.message || "Failed to update footer section");
        }
      } else {
        // Create new section
        response = await FooterService.addSection(sectionData);
        if (response.success) {
          toast.success("Footer section added successfully");
          setSectionModal({ isOpen: false, section: null, isEditing: false });
          await loadFooterData(); // Reload data

          // Trigger ISR cache revalidation
          await handleFooterUpdate();
        } else {
          console.error("Footer section add error:", response);
          toast.error(response.message || "Failed to add footer section");
        }
      }
    } catch (error) {
      console.error("Error saving footer section:", error);
      toast.error("Failed to save footer section");
    }
  };

  const handleSaveLink = async (
    linkData: FooterLinkFormData,
    sectionId?: string
  ) => {
    try {
      let response: ContentResponse;

      if (linkModal.isEditing) {
        // Update existing link - use the sectionId from modal state
        if (!linkModal.sectionId) {
          toast.error("Could not find the section for this link");
          return;
        }

        if (!linkModal.link?.id) {
          toast.error("Invalid link ID");
          return;
        }

        response = await FooterService.updateLink(
          linkModal.sectionId,
          linkModal.link.id,
          linkData
        );
        if (response.success) {
          toast.success("Footer link updated successfully");
          setLinkModal({
            isOpen: false,
            link: null,
            sectionId: undefined,
            isEditing: false,
          });
          await loadFooterData(); // Reload data

          // Trigger ISR cache revalidation
          await handleFooterUpdate();
        } else {
          console.error("Footer link update error:", response);
          toast.error(response.message || "Failed to update footer link");
        }
      } else {
        // Create new link
        const targetSectionId = sectionId || linkModal.sectionId;
        if (!targetSectionId) {
          toast.error("Please select a section for the new link");
          return;
        }

        response = await FooterService.addLink(targetSectionId, linkData);
        if (response.success) {
          toast.success("Footer link added successfully");
          setLinkModal({
            isOpen: false,
            link: null,
            sectionId: undefined,
            isEditing: false,
          });
          await loadFooterData(); // Reload data

          // Trigger ISR cache revalidation
          await handleFooterUpdate();
        } else {
          console.error("Footer link add error:", response);
          toast.error(response.message || "Failed to add footer link");
        }
      }
    } catch (error) {
      console.error("Error saving footer link:", error);
      toast.error("Failed to save footer link");
    }
  };

  const handleDeleteSectionClick = (section: FooterSection) => {
    setDeleteConfirmModal({
      isOpen: true,
      type: "section",
      item: section,
    });
  };

  const handleDeleteLinkClick = (link: FooterLink, sectionId: string) => {
    setDeleteConfirmModal({
      isOpen: true,
      type: "link",
      item: link,
      sectionId,
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmModal.item) return;

    try {
      setIsDeleting(deleteConfirmModal.item.id);
      let response: ContentResponse;

      if (deleteConfirmModal.type === "section") {
        response = await FooterService.deleteSection(
          deleteConfirmModal.item.id
        );
      } else if (
        deleteConfirmModal.type === "link" &&
        deleteConfirmModal.sectionId
      ) {
        response = await FooterService.deleteLink(
          deleteConfirmModal.sectionId,
          deleteConfirmModal.item.id
        );
      } else {
        return;
      }

      if (response.success) {
        toast.success(
          `${deleteConfirmModal.type === "section" ? "Footer section" : "Footer link"} deleted successfully`
        );
        await loadFooterData(); // Reload data
        setDeleteConfirmModal({ isOpen: false, type: null, item: null });
      } else {
        toast.error(
          response.message || `Failed to delete ${deleteConfirmModal.type}`
        );
      }
    } catch (error) {
      console.error(`Error deleting ${deleteConfirmModal.type}:`, error);
      toast.error(`Failed to delete ${deleteConfirmModal.type}`);
    } finally {
      setIsDeleting(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmModal({ isOpen: false, type: null, item: null });
  };

  const handleUpdateContactInfo = async (contactData: ContactInfoFormData) => {
    try {
      const response = await FooterService.updateContactInfo(contactData);
      if (response.success) {
        toast.success("Contact information updated successfully");
        setContactModal({ isOpen: false });
        await loadFooterData(); // Reload data

        // Trigger ISR cache revalidation
        await handleFooterUpdate();
      } else {
        toast.error(response.message || "Failed to update contact information");
      }
    } catch (error) {
      console.error("Error updating contact info:", error);
      toast.error("Failed to update contact information");
    }
  };

  const handleUpdateGeneralInfo = async (data: FooterFormData) => {
    // Use Redux for general info updates
    await updateGeneralInfoRedux(data);
  };

  if (reduxLoading || isLoading || isInitialLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading footer data...</span>
        </div>
      </div>
    );
  }

  if (!footerData) {
    return (
      <div className="text-center py-12">
        <div className="text-muted-foreground">
          Failed to load footer data. Please try again.
        </div>
        <Button onClick={loadFooterData} className="mt-4">
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Footer Management</h3>
          <p className="text-sm text-muted-foreground">
            Customize footer content, links, and contact information
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={loadFooterData}
          disabled={isLoading || isInitialLoading}
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${(isLoading || isInitialLoading) ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="sections" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="sections">Sections</TabsTrigger>
          <TabsTrigger value="contact">Contact Info</TabsTrigger>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="sections" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Footer Sections</h3>
              <p className="text-sm text-muted-foreground">
                Manage footer sections and their links
              </p>
            </div>
            <Button
              onClick={() =>
                setSectionModal({
                  isOpen: true,
                  section: null,
                  isEditing: false,
                })
              }
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New Section
            </Button>
          </div>

          <div className="space-y-4">
            {footerData.sections.map((section) => (
              <Card key={section.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div>
                        <CardTitle className="text-lg">
                          {section.title}
                        </CardTitle>
                        <CardDescription>
                          {section.links.length} links • Order: {section.order}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={section.isActive}
                          onCheckedChange={(checked) =>
                            setFooterData((prev) => {
                              if (!prev) return prev;
                              return {
                                ...prev,
                                sections: prev.sections.map((s) =>
                                  s.id === section.id
                                    ? { ...s, isActive: checked }
                                    : s
                                ),
                              };
                            })
                          }
                        />
                        <span className="text-sm text-muted-foreground">
                          {section.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setSectionModal({
                            isOpen: true,
                            section,
                            isEditing: true,
                          })
                        }
                      >
                        Edit Section
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteSectionClick(section)}
                        disabled={isDeleting === section.id}
                      >
                        {isDeleting === section.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {section.links.map((link) => (
                      <div
                        key={link.id}
                        className="flex items-center justify-between p-2 border rounded"
                      >
                        <div className="flex items-center gap-2">
                          <Link className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{link.title}</span>
                          <span className="text-xs text-muted-foreground">
                            ({link.url})
                          </span>
                          {link.isExternal && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-1 rounded">
                              External
                            </span>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setLinkModal({
                                isOpen: true,
                                link,
                                sectionId: section.id,
                                isEditing: true,
                              })
                            }
                          >
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleDeleteLinkClick(link, section.id)
                            }
                            disabled={isDeleting === link.id}
                          >
                            {isDeleting === link.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setLinkModal({
                          isOpen: true,
                          link: null,
                          sectionId: section.id,
                          isEditing: false,
                        })
                      }
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Link to {section.title}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {footerData.sections.length === 0 && (
              <Card>
                <CardContent className="text-center py-8">
                  <div className="text-muted-foreground">
                    No footer sections yet. Create your first section to get
                    started.
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="contact" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Contact Information</h3>
              <p className="text-sm text-muted-foreground">
                Manage contact details and social media links
              </p>
            </div>
            <Button onClick={() => setContactModal({ isOpen: true })}>
              <Mail className="h-4 w-4 mr-2" />
              Edit Contact Info
            </Button>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <div className="text-sm text-muted-foreground">
                      {footerData.contactInfo.email || "Not set"}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <div className="text-sm text-muted-foreground">
                      {footerData.contactInfo.phone || "Not set"}
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Address</Label>
                  <div className="text-sm text-muted-foreground">
                    {footerData.contactInfo.address || "Not set"}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Social Media</Label>
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    {footerData.contactInfo.socialMedia?.facebook && (
                      <div>
                        Facebook: {footerData.contactInfo.socialMedia.facebook}
                      </div>
                    )}
                    {footerData.contactInfo.socialMedia?.twitter && (
                      <div>
                        Twitter: {footerData.contactInfo.socialMedia.twitter}
                      </div>
                    )}
                    {footerData.contactInfo.socialMedia?.instagram && (
                      <div>
                        Instagram:{" "}
                        {footerData.contactInfo.socialMedia.instagram}
                      </div>
                    )}
                    {footerData.contactInfo.socialMedia?.github && (
                      <div>
                        GitHub: {footerData.contactInfo.socialMedia.github}
                      </div>
                    )}
                    {!footerData.contactInfo.socialMedia?.facebook &&
                      !footerData.contactInfo.socialMedia?.twitter &&
                      !footerData.contactInfo.socialMedia?.instagram &&
                      !footerData.contactInfo.socialMedia?.github && (
                        <div>No social media links set</div>
                      )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="general" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">General Information</h3>
              <p className="text-sm text-muted-foreground">
                Manage footer branding and general settings
              </p>
            </div>
            <Button onClick={openGeneralModal}>
              <Save className="h-4 w-4 mr-2" />
              Edit General Info
            </Button>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Description</Label>
                  <div className="text-sm text-muted-foreground">
                    {footerData.description || "Not set"}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Copyright</Label>
                  <div className="text-sm text-muted-foreground">
                    {footerData.copyright || "Not set"}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Logo URL</Label>
                  <div className="text-sm text-muted-foreground">
                    {footerData.logoUrl || "Not set"}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Logo Alt Text</Label>
                  <div className="text-sm text-muted-foreground">
                    {footerData.logoAlt || "Not set"}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Footer Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <FooterPreview footerData={footerData} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Footer Section Modal */}
      <Dialog
        open={sectionModal.isOpen}
        onOpenChange={(open) =>
          setSectionModal({ isOpen: open, section: null, isEditing: false })
        }
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {sectionModal.isEditing
                ? "Edit Footer Section"
                : "Add New Footer Section"}
            </DialogTitle>
          </DialogHeader>
          <FooterSectionForm
            section={sectionModal.section}
            onSave={handleSaveSection}
            onCancel={() =>
              setSectionModal({
                isOpen: false,
                section: null,
                isEditing: false,
              })
            }
          />
        </DialogContent>
      </Dialog>

      {/* Footer Link Modal */}
      <Dialog
        open={linkModal.isOpen}
        onOpenChange={(open) =>
          setLinkModal({
            isOpen: open,
            link: null,
            sectionId: undefined,
            isEditing: false,
          })
        }
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {linkModal.isEditing ? "Edit Footer Link" : "Add New Footer Link"}
            </DialogTitle>
          </DialogHeader>
          <FooterLinkForm
            link={linkModal.link}
            sections={footerData.sections}
            onSave={handleSaveLink}
            onCancel={() =>
              setLinkModal({
                isOpen: false,
                link: null,
                sectionId: undefined,
                isEditing: false,
              })
            }
          />
        </DialogContent>
      </Dialog>

      {/* Contact Info Modal */}
      <Dialog
        open={contactModal.isOpen}
        onOpenChange={(open) => setContactModal({ isOpen: open })}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Contact Information</DialogTitle>
          </DialogHeader>
          <ContactInfoForm
            contactInfo={footerData.contactInfo}
            onSave={handleUpdateContactInfo}
          />
        </DialogContent>
      </Dialog>

      {/* General Info Modal */}
      <Dialog
        open={isGeneralModalOpen}
        onOpenChange={(open) => open ? openGeneralModal() : closeGeneralModal()}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit General Information</DialogTitle>
          </DialogHeader>
          <GeneralInfoForm
            data={{
              copyright: footerData?.copyright || '',
              description: footerData?.description || '',
              logoUrl: footerData?.logoUrl || '',
              logoAlt: footerData?.logoAlt || '',
            }}
            onSave={handleUpdateGeneralInfo}
            onCancel={closeGeneralModal}
            isLoading={reduxUpdating}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog
        open={deleteConfirmModal.isOpen}
        onOpenChange={handleDeleteCancel}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Confirm Delete
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete{" "}
              <strong>"{deleteConfirmModal.item?.title}"</strong>{" "}
              {deleteConfirmModal.type === "section" ? "section" : "link"}? This
              action cannot be undone.
            </p>
            {deleteConfirmModal.item && (
              <div className="p-3 bg-muted rounded-lg">
                <div className="text-sm">
                  <div className="font-medium">
                    {deleteConfirmModal.type === "section" ? "Section" : "Link"}{" "}
                    Details:
                  </div>
                  <div className="text-muted-foreground mt-1">
                    <div>Title: {deleteConfirmModal.item.title}</div>
                    {deleteConfirmModal.type === "link" && (
                      <div>URL: {deleteConfirmModal.item.url}</div>
                    )}
                    <div>
                      Status:{" "}
                      {deleteConfirmModal.item.isActive ? "Active" : "Inactive"}
                    </div>
                    <div>Order: {deleteConfirmModal.item.order}</div>
                  </div>
                </div>
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={handleDeleteCancel}
                disabled={isDeleting === deleteConfirmModal.item?.id}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteConfirm}
                disabled={isDeleting === deleteConfirmModal.item?.id}
              >
                {isDeleting === deleteConfirmModal.item?.id ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Form Components
function FooterSectionForm({
  section,
  onSave,
  onCancel,
}: {
  section?: FooterSection;
  onSave: (data: FooterSectionFormData) => Promise<void>;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState<FooterSectionFormData>({
    title: section?.title || "",
    isActive: section?.isActive ?? true,
    order: section?.order || 1,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form when section changes
  useEffect(() => {
    setFormData({
      title: section?.title || "",
      isActive: section?.isActive ?? true,
      order: section?.order || 1,
    });
    setErrors({});
  }, [section]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Section title is required";
    } else if (formData.title.length > 100) {
      newErrors.title = "Section title must be less than 100 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setIsSaving(true);

      // Clean form data - convert empty strings to undefined for optional fields
      const cleanedFormData: FooterSectionFormData = {
        title: formData.title.trim(),
        isActive: formData.isActive,
        order: formData.order,
      };

      await onSave(cleanedFormData);
      if (!section) {
        setFormData({ title: "", isActive: true, order: 1 });
      }
    } catch (error) {
      console.error("Error saving footer section:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Section Title *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => {
            const value = e.target.value;
            setFormData((prev) => ({ ...prev, title: value }));
            if (errors.title) {
              setErrors((prev) => ({ ...prev, title: "" }));
            }
          }}
          placeholder="Enter section title"
          className={errors.title ? "border-red-500" : ""}
        />
        {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
      </div>
      <div className="flex items-center space-x-2">
        <Switch
          id="isActive"
          checked={formData.isActive}
          onCheckedChange={(checked) =>
            setFormData((prev) => ({ ...prev, isActive: checked }))
          }
        />
        <Label htmlFor="isActive">Active</Label>
      </div>
      <div className="flex gap-2">
        <Button
          type="submit"
          disabled={isSaving || Object.keys(errors).length > 0}
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          {isSaving ? "Saving..." : section ? "Update Section" : "Add Section"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSaving}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

function FooterLinkForm({
  link,
  sections,
  onSave,
  onCancel,
}: {
  link?: FooterLink;
  sections: FooterSection[];
  onSave: (data: FooterLinkFormData, sectionId?: string) => Promise<void>;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState<FooterLinkFormData>({
    title: link?.title || "",
    url: link?.url || "",
    isExternal: link?.isExternal ?? false,
    isActive: link?.isActive ?? true,
    order: link?.order || 1,
  });
  const [selectedSectionId, setSelectedSectionId] = useState<string>(
    sections[0]?.id || ""
  );
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form when link changes
  useEffect(() => {
    setFormData({
      title: link?.title || "",
      url: link?.url || "",
      isExternal: link?.isExternal ?? false,
      isActive: link?.isActive ?? true,
      order: link?.order || 1,
    });
    setSelectedSectionId(sections[0]?.id || "");
    setErrors({});
  }, [link, sections]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Link title is required";
    } else if (formData.title.length > 100) {
      newErrors.title = "Link title must be less than 100 characters";
    }

    if (!formData.url.trim()) {
      newErrors.url = "URL is required";
    } else if (!isValidUrl(formData.url)) {
      newErrors.url = "Please enter a valid URL";
    }

    if (!selectedSectionId) {
      newErrors.section = "Please select a section";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url: string) => {
    try {
      // Clean the URL first
      let cleanUrl = url.trim();

      // Fix URLs with multiple slashes after protocol (e.g., https:///shop -> https://shop)
      if (cleanUrl.includes(":///")) {
        cleanUrl = cleanUrl.replace(/:\/\/\//g, "://");
      }

      // Ensure URL has a protocol
      const urlWithProtocol =
        cleanUrl.startsWith("http://") || cleanUrl.startsWith("https://")
          ? cleanUrl
          : `https://${cleanUrl}`;

      new URL(urlWithProtocol);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setIsSaving(true);

      // Clean form data - convert empty strings to undefined for optional fields
      let cleanUrl = formData.url.trim();

      // Fix URLs with multiple slashes after protocol (e.g., https:///shop -> https://shop)
      if (cleanUrl.includes(":///")) {
        cleanUrl = cleanUrl.replace(/:\/\/\//g, "://");
      }

      const cleanedFormData: FooterLinkFormData = {
        title: formData.title.trim(),
        url:
          cleanUrl.startsWith("http://") || cleanUrl.startsWith("https://")
            ? cleanUrl
            : `https://${cleanUrl}`,
        isExternal: formData.isExternal,
        isActive: formData.isActive,
        order: formData.order,
      };

      await onSave(cleanedFormData, selectedSectionId);
      if (!link) {
        setFormData({
          title: "",
          url: "",
          isExternal: false,
          isActive: true,
          order: 1,
        });
        setSelectedSectionId(sections[0]?.id || "");
      }
    } catch (error) {
      console.error("Error saving footer link:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!link && (
        <div className="space-y-2">
          <Label htmlFor="section">Section *</Label>
          <select
            id="section"
            value={selectedSectionId}
            onChange={(e) => {
              setSelectedSectionId(e.target.value);
              if (errors.section) {
                setErrors((prev) => ({ ...prev, section: "" }));
              }
            }}
            className={`w-full px-3 py-2 border rounded-md ${errors.section ? "border-red-500" : "border-gray-300"}`}
          >
            <option value="">Select a section</option>
            {sections.map((section) => (
              <option key={section.id} value={section.id}>
                {section.title}
              </option>
            ))}
          </select>
          {errors.section && (
            <p className="text-sm text-red-500">{errors.section}</p>
          )}
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="title">Link Title *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => {
            const value = e.target.value;
            setFormData((prev) => ({ ...prev, title: value }));
            if (errors.title) {
              setErrors((prev) => ({ ...prev, title: "" }));
            }
          }}
          placeholder="Enter link title"
          className={errors.title ? "border-red-500" : ""}
        />
        {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="url">URL *</Label>
        <Input
          id="url"
          value={formData.url}
          onChange={(e) => {
            const value = e.target.value;
            setFormData((prev) => ({ ...prev, url: value }));
            if (errors.url) {
              setErrors((prev) => ({ ...prev, url: "" }));
            }
          }}
          placeholder="Enter URL"
          className={errors.url ? "border-red-500" : ""}
        />
        {errors.url && <p className="text-sm text-red-500">{errors.url}</p>}
      </div>
      <div className="flex items-center space-x-2">
        <Switch
          id="isExternal"
          checked={formData.isExternal}
          onCheckedChange={(checked) =>
            setFormData((prev) => ({ ...prev, isExternal: checked }))
          }
        />
        <Label htmlFor="isExternal">External Link</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Switch
          id="isActive"
          checked={formData.isActive}
          onCheckedChange={(checked) =>
            setFormData((prev) => ({ ...prev, isActive: checked }))
          }
        />
        <Label htmlFor="isActive">Active</Label>
      </div>
      <div className="flex gap-2">
        <Button
          type="submit"
          disabled={isSaving || Object.keys(errors).length > 0}
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          {isSaving ? "Saving..." : link ? "Update Link" : "Add Link"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSaving}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

function ContactInfoForm({
  contactInfo,
  onSave,
}: {
  contactInfo: ContactInfo;
  onSave: (data: ContactInfoFormData) => Promise<void>;
}) {
  const [formData, setFormData] = useState<ContactInfoFormData>({
    email: contactInfo.email || "",
    phone: contactInfo.phone || "",
    address: contactInfo.address || "",
    socialMedia: contactInfo.socialMedia || {},
  });
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form when contactInfo changes
  useEffect(() => {
    setFormData({
      email: contactInfo.email || "",
      phone: contactInfo.phone || "",
      address: contactInfo.address || "",
      socialMedia: contactInfo.socialMedia || {},
    });
    setErrors({});
  }, [contactInfo]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (formData.email && !isValidEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setIsSaving(true);

      // Clean form data - convert empty strings to undefined for optional fields
      const formatUrl = (url: string | undefined) => {
        if (!url?.trim()) return undefined;
        let trimmed = url.trim();

        // Fix URLs with multiple slashes after protocol (e.g., https:///shop -> https://shop)
        if (trimmed.includes(":///")) {
          trimmed = trimmed.replace(/:\/\/\//g, "://");
        }

        return trimmed.startsWith("http://") || trimmed.startsWith("https://")
          ? trimmed
          : `https://${trimmed}`;
      };

      const cleanedFormData: ContactInfoFormData = {
        email: formData.email?.trim() || undefined,
        phone: formData.phone?.trim() || undefined,
        address: formData.address?.trim() || undefined,
        socialMedia: {
          facebook: formatUrl(formData.socialMedia?.facebook),
          twitter: formatUrl(formData.socialMedia?.twitter),
          instagram: formatUrl(formData.socialMedia?.instagram),
          github: formatUrl(formData.socialMedia?.github),
        },
      };

      await onSave(cleanedFormData);
    } catch (error) {
      console.error("Error saving contact info:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => {
              const value = e.target.value;
              setFormData((prev) => ({ ...prev, email: value }));
              if (errors.email) {
                setErrors((prev) => ({ ...prev, email: "" }));
              }
            }}
            placeholder="support@example.com"
            className={errors.email ? "border-red-500" : ""}
          />
          {errors.email && (
            <p className="text-sm text-red-500">{errors.email}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, phone: e.target.value }))
            }
            placeholder="+1 (555) 123-4567"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Textarea
          id="address"
          value={formData.address}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, address: e.target.value }))
          }
          placeholder="Enter full address"
          rows={2}
        />
      </div>
      <div className="space-y-4">
        <Label>Social Media Links</Label>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="facebook">Facebook</Label>
            <Input
              id="facebook"
              value={formData.socialMedia?.facebook || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  socialMedia: {
                    ...prev.socialMedia,
                    facebook: e.target.value,
                  },
                }))
              }
              placeholder="https://facebook.com/yourpage"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="twitter">Twitter</Label>
            <Input
              id="twitter"
              value={formData.socialMedia?.twitter || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  socialMedia: { ...prev.socialMedia, twitter: e.target.value },
                }))
              }
              placeholder="https://twitter.com/yourpage"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="instagram">Instagram</Label>
            <Input
              id="instagram"
              value={formData.socialMedia?.instagram || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  socialMedia: {
                    ...prev.socialMedia,
                    instagram: e.target.value,
                  },
                }))
              }
              placeholder="https://instagram.com/yourpage"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="github">GitHub</Label>
            <Input
              id="github"
              value={formData.socialMedia?.github || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  socialMedia: { ...prev.socialMedia, github: e.target.value },
                }))
              }
              placeholder="https://github.com/yourpage"
            />
          </div>
        </div>
      </div>
      <Button
        type="submit"
        disabled={isSaving || Object.keys(errors).length > 0}
      >
        {isSaving ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <Save className="h-4 w-4 mr-2" />
        )}
        {isSaving ? "Saving..." : "Update Contact Info"}
      </Button>
    </form>
  );
}

function GeneralInfoForm({
  data,
  onSave,
  onCancel,
  isLoading = false,
}: {
  data: {
    copyright: string;
    description: string;
    logoUrl: string;
    logoAlt: string;
  };
  onSave: (data: FooterFormData) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}) {
  const [formData, setFormData] = useState<FooterFormData>({
    copyright: data.copyright || "",
    description: data.description || "",
    logoUrl: data.logoUrl || "",
    logoAlt: data.logoAlt || "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Use external loading state if provided
  const actualIsSaving = isLoading || isSaving;

  // Reset form when data changes
  useEffect(() => {
    setFormData({
      copyright: data.copyright || "",
      description: data.description || "",
      logoUrl: data.logoUrl || "",
      logoAlt: data.logoAlt || "",
    });
    setErrors({});
  }, [data]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (formData.logoUrl && !isValidUrl(formData.logoUrl)) {
      newErrors.logoUrl = "Please enter a valid URL";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url: string) => {
    try {
      // Clean the URL first
      let cleanUrl = url.trim();

      // Fix URLs with multiple slashes after protocol (e.g., https:///shop -> https://shop)
      if (cleanUrl.includes(":///")) {
        cleanUrl = cleanUrl.replace(/:\/\/\//g, "://");
      }

      // Ensure URL has a protocol
      const urlWithProtocol =
        cleanUrl.startsWith("http://") || cleanUrl.startsWith("https://")
          ? cleanUrl
          : `https://${cleanUrl}`;

      new URL(urlWithProtocol);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      if (!isLoading) {
        setIsSaving(true);
      }

      // Clean form data - convert empty strings to undefined for optional fields
      let cleanLogoUrl = formData.logoUrl?.trim();

      // If it starts with multiple slashes, clean it up
      if (cleanLogoUrl && cleanLogoUrl.startsWith("///")) {
        cleanLogoUrl = cleanLogoUrl.replace(/^\/+/, "");
      }

      const cleanedFormData: FooterFormData = {
        copyright: formData.copyright?.trim() || undefined,
        description: formData.description?.trim() || undefined,
        logoUrl: cleanLogoUrl
          ? cleanLogoUrl.startsWith("http://") ||
            cleanLogoUrl.startsWith("https://")
            ? cleanLogoUrl
            : `https://${cleanLogoUrl}`
          : undefined,
        logoAlt: formData.logoAlt?.trim() || undefined,
      };

      await onSave(cleanedFormData);
    } catch (error) {
      console.error("Error saving general info:", error);
    } finally {
      if (!isLoading) {
        setIsSaving(false);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, description: e.target.value }))
          }
          placeholder="Enter footer description"
          rows={3}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="copyright">Copyright Text</Label>
        <Input
          id="copyright"
          value={formData.copyright}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, copyright: e.target.value }))
          }
          placeholder="© 2024 Your Company. All rights reserved."
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="logoUrl">Footer Logo URL</Label>
        <Input
          id="logoUrl"
          value={formData.logoUrl}
          onChange={(e) => {
            const value = e.target.value;
            setFormData((prev) => ({ ...prev, logoUrl: value }));
            if (errors.logoUrl) {
              setErrors((prev) => ({ ...prev, logoUrl: "" }));
            }
          }}
          placeholder="/images/logo-footer.png"
          className={errors.logoUrl ? "border-red-500" : ""}
        />
        {errors.logoUrl && (
          <p className="text-sm text-red-500">{errors.logoUrl}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="logoAlt">Logo Alt Text</Label>
        <Input
          id="logoAlt"
          value={formData.logoAlt}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, logoAlt: e.target.value }))
          }
          placeholder="Company Footer Logo"
        />
      </div>
      <div className="flex gap-2">
        <Button
          type="submit"
          disabled={actualIsSaving || Object.keys(errors).length > 0}
        >
          {actualIsSaving ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          {actualIsSaving ? "Saving..." : "Update General Info"}
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={actualIsSaving}
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}

function FooterPreview({ footerData }: { footerData: FooterData }) {
  return (
    <div className="bg-gray-50 p-6 rounded-lg">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="space-y-4">
            {footerData.logoUrl && (
              <img
                src={footerData.logoUrl}
                alt={footerData.logoAlt}
                className="h-8"
              />
            )}
            <p className="text-sm text-gray-600">{footerData.description}</p>
          </div>

          {/* Footer Sections */}
          {footerData.sections
            .filter((section) => section.isActive)
            .map((section) => (
              <div key={section.id} className="space-y-4">
                <h3 className="font-semibold text-gray-900">{section.title}</h3>
                <ul className="space-y-2">
                  {section.links
                    .filter((link) => link.isActive)
                    .map((link) => (
                      <li key={link.id}>
                        <a
                          href={link.url}
                          className="text-sm text-gray-600 hover:text-gray-900"
                          target={link.isExternal ? "_blank" : "_self"}
                          rel={
                            link.isExternal ? "noopener noreferrer" : undefined
                          }
                        >
                          {link.title}
                        </a>
                      </li>
                    ))}
                </ul>
              </div>
            ))}
        </div>

        {/* Contact Info */}
        <div className="border-t pt-6 mt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="h-4 w-4" />
                {footerData.contactInfo.email}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="h-4 w-4" />
                {footerData.contactInfo.phone}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4" />
                {footerData.contactInfo.address}
              </div>
            </div>
            <div className="flex gap-4">
              {footerData.contactInfo.socialMedia.facebook && (
                <a
                  href={footerData.contactInfo.socialMedia.facebook}
                  className="text-gray-600 hover:text-gray-900"
                >
                  Facebook
                </a>
              )}
              {footerData.contactInfo.socialMedia.twitter && (
                <a
                  href={footerData.contactInfo.socialMedia.twitter}
                  className="text-gray-600 hover:text-gray-900"
                >
                  Twitter
                </a>
              )}
              {footerData.contactInfo.socialMedia.instagram && (
                <a
                  href={footerData.contactInfo.socialMedia.instagram}
                  className="text-gray-600 hover:text-gray-900"
                >
                  Instagram
                </a>
              )}
              {footerData.contactInfo.socialMedia.github && (
                <a
                  href={footerData.contactInfo.socialMedia.github}
                  className="text-gray-600 hover:text-gray-900"
                >
                  GitHub
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t pt-4 mt-6">
          <p className="text-sm text-gray-500 text-center">
            {footerData.copyright}
          </p>
        </div>
      </div>
    </div>
  );
}
