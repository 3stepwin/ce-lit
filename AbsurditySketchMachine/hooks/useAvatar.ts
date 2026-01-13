// ========================================
// AVATAR MANAGEMENT HOOK
// ========================================

import { useCallback, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as Haptics from 'expo-haptics';
import { useAppStore } from '../store/useAppStore';
import {
    uploadAvatar,
    callCreateFaceModel,
    updateProfile,
    supabase,
} from '../lib/supabase';
import type { UserAvatar, FaceModelStatus } from '../types';
import { LIMITS } from '../lib/constants';

export function useAvatar() {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const {
        user,
        avatars,
        selectedAvatarId,
        faceModelStatus,
        addAvatar,
        setSelectedAvatar,
        setFaceModelStatus,
    } = useAppStore();

    // ========================================
    // REQUEST PERMISSIONS
    // ========================================

    const requestCameraPermission = useCallback(async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        return status === 'granted';
    }, []);

    const requestMediaLibraryPermission = useCallback(async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        return status === 'granted';
    }, []);

    // ========================================
    // CAPTURE SELFIE
    // ========================================

    const captureSelfie = useCallback(async (): Promise<string | null> => {
        try {
            const hasPermission = await requestCameraPermission();
            if (!hasPermission) {
                console.error('Camera permission denied');
                return null;
            }

            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ['images'],
                cameraType: ImagePicker.CameraType.front,
                quality: 0.8,
                allowsEditing: true,
                aspect: [1, 1], // Square for face
            });

            if (result.canceled || !result.assets[0]) {
                return null;
            }

            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            return result.assets[0].uri;
        } catch (error) {
            console.error('Error capturing selfie:', error);
            return null;
        }
    }, [requestCameraPermission]);

    // ========================================
    // PICK FROM GALLERY
    // ========================================

    const pickFromGallery = useCallback(async (): Promise<string | null> => {
        try {
            const hasPermission = await requestMediaLibraryPermission();
            if (!hasPermission) {
                console.error('Media library permission denied');
                return null;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                quality: 0.8,
                allowsEditing: true,
                aspect: [1, 1],
            });

            if (result.canceled || !result.assets[0]) {
                return null;
            }

            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            return result.assets[0].uri;
        } catch (error) {
            console.error('Error picking from gallery:', error);
            return null;
        }
    }, [requestMediaLibraryPermission]);

    // ========================================
    // COMPRESS IMAGE
    // ========================================

    const compressImage = useCallback(async (uri: string): Promise<string> => {
        try {
            const result = await ImageManipulator.manipulateAsync(
                uri,
                [{ resize: { width: 1024 } }], // Max 1024px width
                {
                    compress: 0.7, // 70% quality
                    format: ImageManipulator.SaveFormat.JPEG,
                }
            );
            return result.uri;
        } catch (error) {
            console.error('Error compressing image:', error);
            return uri; // Return original if compression fails
        }
    }, []);

    // ========================================
    // UPLOAD AVATAR
    // ========================================

    const uploadAvatarImage = useCallback(async (uri: string): Promise<UserAvatar | null> => {
        if (!user?.id) {
            console.error('No user ID');
            return null;
        }

        setIsUploading(true);
        setUploadProgress(0);

        try {
            // Compress before upload
            setUploadProgress(10);
            const compressedUri = await compressImage(uri);

            // Generate filename
            const fileName = `avatar_${Date.now()}.jpg`;
            setUploadProgress(30);

            // Upload to Supabase Storage
            const uploadResult = await uploadAvatar(user.id, compressedUri, fileName);
            setUploadProgress(70);

            if (!uploadResult) {
                throw new Error('Upload failed');
            }

            // Save to database
            const { data, error } = await supabase
                .from('user_avatars')
                .insert({
                    user_id: user.id,
                    storage_path: uploadResult.storagePath,
                    public_url: uploadResult.publicUrl,
                    type: 'image',
                    is_primary: avatars.length === 0, // First one is primary
                })
                .select()
                .single();

            if (error) throw error;

            setUploadProgress(100);

            const newAvatar: UserAvatar = {
                id: data.id,
                userId: data.user_id,
                storagePath: data.storage_path,
                publicUrl: data.public_url,
                type: data.type,
                isPrimary: data.is_primary,
                createdAt: data.created_at,
            };

            addAvatar(newAvatar);

            // Auto-select if first avatar
            if (avatars.length === 0) {
                setSelectedAvatar(newAvatar.id);
            }

            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            return newAvatar;
        } catch (error) {
            console.error('Error uploading avatar:', error);
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            return null;
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
    }, [user?.id, avatars.length, compressImage, addAvatar, setSelectedAvatar]);

    // ========================================
    // CREATE FACE MODEL
    // ========================================

    const createFaceModel = useCallback(async (): Promise<boolean> => {
        if (!user?.id) {
            console.error('No user ID');
            return false;
        }

        if (avatars.length === 0) {
            console.error('No avatars to create face model');
            return false;
        }

        try {
            setFaceModelStatus('processing');

            // Get avatar URLs
            const avatarUrls = avatars.map((a) => a.publicUrl);

            // Call edge function
            const { data, error } = await callCreateFaceModel(user.id, avatarUrls);

            if (error) throw error;

            if (data?.faceModelId) {
                // Update profile with face model ID
                await updateProfile(user.id, {
                    face_model_id: data.faceModelId,
                    face_model_status: 'ready',
                });

                setFaceModelStatus('ready');
                await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                return true;
            }

            throw new Error('No face model ID returned');
        } catch (error) {
            console.error('Error creating face model:', error);
            setFaceModelStatus('failed');
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            return false;
        }
    }, [user?.id, avatars, setFaceModelStatus]);

    // ========================================
    // CHECK IF READY
    // ========================================

    const isAvatarReady = avatars.length > 0 && faceModelStatus === 'ready';
    const canCreateFaceModel = avatars.length > 0 && faceModelStatus === 'pending';

    return {
        avatars,
        selectedAvatarId,
        faceModelStatus,
        isUploading,
        uploadProgress,
        isAvatarReady,
        canCreateFaceModel,
        captureSelfie,
        pickFromGallery,
        uploadAvatarImage,
        createFaceModel,
        setSelectedAvatar,
    };
}
