
import { useState, useEffect, useCallback } from 'react';
import pb from '@/lib/pocketbaseClient';

export const useUserProfile = (userId) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUserProfile = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const record = await pb.collection('userProfile').getFirstListItem(`userId="${userId}"`, { $autoCancel: false });
      setProfile(record);
    } catch (err) {
      if (err.status !== 404) {
        setError(err);
      }
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  const saveUserProfile = async (data) => {
    try {
      let record;
      if (profile?.id) {
        record = await pb.collection('userProfile').update(profile.id, data, { $autoCancel: false });
      } else {
        record = await pb.collection('userProfile').create({ ...data, userId }, { $autoCancel: false });
      }
      setProfile(record);
      return record;
    } catch (err) {
      throw err;
    }
  };

  const uploadProfilePhoto = async (file) => {
    const formData = new FormData();
    formData.append('profilePhoto', file);
    
    if (profile?.id) {
      const record = await pb.collection('userProfile').update(profile.id, formData, { $autoCancel: false });
      setProfile(record);
      return record;
    } else {
      formData.append('userId', userId);
      const record = await pb.collection('userProfile').create(formData, { $autoCancel: false });
      setProfile(record);
      return record;
    }
  };

  return { profile, loading, error, saveUserProfile, uploadProfilePhoto, fetchUserProfile };
};
