import React, { useState, useEffect } from 'react';
import { MapPin, Mail, Phone, UserCircle } from 'lucide-react';
import pb from '@/lib/pocketbaseClient';

const TeacherBanner = ({ teacher }) => {
  const [imageError, setImageError] = useState(false);

  // Reset image error state if the teacher record changes
  useEffect(() => {
    setImageError(false);
  }, [teacher?.id]);

  const bannerUrl = teacher?.banner_image 
    ? pb.files.getUrl(teacher, teacher.banner_image) 
    : null;

  // --- AVATAR URL GENERATION FLOW & DEBUGGING ---
  // 1. Log the raw teacher object to inspect available fields
  console.log('[TeacherBanner] Full teacher record:', teacher);
  
  // 2. Log the specific avatar fields. 
  // NOTE: The 'teachers' collection schema uses 'profile_photo', while 'users' uses 'avatar'.
  // We check both to ensure compatibility.
  console.log('[TeacherBanner] teacher.avatar field value:', teacher?.avatar);
  console.log('[TeacherBanner] teacher.profile_photo field value:', teacher?.profile_photo);

  // 3. Determine the correct filename to use
  const avatarFilename = teacher?.avatar || teacher?.profile_photo;
  
  // 4. Generate the URL only if the filename exists and is not empty
  let avatarUrl = null;
  if (teacher && avatarFilename) {
    try {
      // pb.files.getUrl requires the full record object and the filename string
      avatarUrl = pb.files.getUrl(teacher, avatarFilename);
      console.log('[TeacherBanner] Successfully generated avatar URL:', avatarUrl);
    } catch (err) {
      console.error('[TeacherBanner] Error generating avatar URL:', err);
    }
  } else {
    console.log('[TeacherBanner] No avatar/profile_photo filename found. Skipping URL generation and using fallback.');
  }

  // --- IMAGE EVENT HANDLERS ---
  const handleImageError = () => {
    console.error('[TeacherBanner] Image failed to load from URL:', avatarUrl, '- Falling back to initial display.');
    setImageError(true);
  };

  const handleImageLoad = () => {
    console.log('[TeacherBanner] Image loaded successfully from URL:', avatarUrl);
  };

  // Fallback initial (first letter of name, or 'P' if name is missing)
  const teacherInitial = teacher?.name ? teacher.name.charAt(0).toUpperCase() : 'P';

  return (
    <div className="bg-card border-b border-border shadow-sm mb-10 pb-8">
      {/* Banner Image */}
      <div className="w-full h-48 md:h-64 relative bg-muted overflow-hidden">
        {bannerUrl ? (
          <img 
            src={bannerUrl} 
            alt={`Banner de ${teacher?.name || 'Professor'}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-primary/20 to-primary/5 flex items-center justify-center">
            <UserCircle className="w-24 h-24 text-primary/20" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent"></div>
      </div>

      {/* Profile Info */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="flex flex-col md:flex-row gap-6 md:items-end -mt-16 md:-mt-20 relative z-10 mb-6">
          
          {/* Avatar Container */}
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl bg-card border-4 border-background shadow-lg overflow-hidden shrink-0 flex items-center justify-center">
            {/* Render image ONLY if we have a valid URL AND it hasn't failed to load */}
            {avatarUrl && !imageError ? (
              <img 
                src={avatarUrl} 
                alt={`Foto de perfil de ${teacher?.name || 'Professor'}`}
                className="w-full h-full object-cover"
                onError={handleImageError}
                onLoad={handleImageLoad}
              />
            ) : (
              <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                <span className="text-4xl font-bold text-primary">{teacherInitial}</span>
              </div>
            )}
          </div>
          
          <div className="flex-1 pb-2">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
              {teacher?.name || 'Professor'}
            </h1>
            <p className="text-lg text-primary font-medium mt-1">Personal</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold mb-3">Sobre mim</h2>
            <p className="text-muted-foreground leading-relaxed text-balance">
              {teacher?.professional_description || "O professor ainda não adicionou uma descrição profissional."}
            </p>
          </div>

          <div className="bg-muted/30 rounded-2xl p-5 border border-border space-y-4">
            <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Contato</h3>
            
            {teacher?.base_city && (
              <div className="flex items-center gap-3 text-foreground/90">
                <div className="w-8 h-8 rounded-lg bg-background border border-border flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm font-medium">{teacher.base_city}</span>
              </div>
            )}

            {teacher?.contact_phone && (
              <div className="flex items-center gap-3 text-foreground/90">
                <div className="w-8 h-8 rounded-lg bg-background border border-border flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm font-medium">{teacher.contact_phone}</span>
              </div>
            )}

            {teacher?.contact_email && (
              <div className="flex items-center gap-3 text-foreground/90">
                <div className="w-8 h-8 rounded-lg bg-background border border-border flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm font-medium">{teacher.contact_email}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherBanner;