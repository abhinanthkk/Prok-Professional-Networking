import React, { useState, useEffect } from 'react';
import { FormField, SkillsInput, ImageUpload } from './FormComponents';
import { mockProfileFormData, validationRules } from './mockData';
import { validateField, validateForm, validateImageFile } from './validationUtils';
import type { ProfileFormData, FormValidation, Experience, Education } from '../../types';
import { useTheme } from '../../App';

const ProfileEdit: React.FC = () => {
  const { theme } = useTheme();
  const [formData, setFormData] = useState<ProfileFormData>(mockProfileFormData);
  const [validation, setValidation] = useState<FormValidation>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading profile data
    const loadProfileData = async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      setIsLoading(false);
    };
    loadProfileData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Validate on change
    const validationResult = validateField(name, value, validationRules);
    setValidation(prev => ({
      ...prev,
      [name]: validationResult
    }));
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const validationResult = validateField(name, value, validationRules);
    setValidation(prev => ({
      ...prev,
      [name]: validationResult
    }));
  };

  const handleSkillsChange = (skills: string[]) => {
    setFormData(prev => ({ ...prev, skills }));
  };

  const handleImageChange = (file: File | null) => {
    setSelectedImage(file);
  };

  const addExperience = () => {
    const newExperience: Experience = {
      id: Date.now(),
      title: '',
      company: '',
      start_date: '',
      end_date: undefined,
      description: '',
      current: false
    };
    setFormData(prev => ({
      ...prev,
      experience: [...prev.experience, newExperience]
    }));
  };

  const updateExperience = (index: number, field: keyof Experience, value: any) => {
    setFormData(prev => ({
      ...prev,
      experience: prev.experience.map((exp, i) => 
        i === index ? { ...exp, [field]: value } : exp
      )
    }));
  };

  const removeExperience = (index: number) => {
    setFormData(prev => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index)
    }));
  };

  const addEducation = () => {
    const newEducation: Education = {
      id: Date.now(),
      school: '',
      degree: '',
      field: '',
      start_date: '',
      end_date: undefined,
      current: false
    };
    setFormData(prev => ({
      ...prev,
      education: [...prev.education, newEducation]
    }));
  };

  const updateEducation = (index: number, field: keyof Education, value: any) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.map((edu, i) => 
        i === index ? { ...edu, [field]: value } : edu
      )
    }));
  };

  const removeEducation = (index: number) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }));
  };

  const validateFormData = (): boolean => {
    const { isValid, validation: newValidation } = validateForm(formData, validationRules);
    setValidation(newValidation);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateFormData()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In production, you would send the data to your API
      console.log('Submitting profile data:', formData);
      
      setSubmitStatus('success');
      setTimeout(() => {
        // Navigate back to profile view
        window.location.href = '/profile';
      }, 2000);
      
    } catch (error) {
      console.error('Error updating profile:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className={`max-w-2xl w-full p-8 rounded-lg shadow-lg backdrop-blur-md ${theme === 'dark' ? 'bg-gradient-to-br from-indigo-900/80 via-gray-900/80 to-purple-900/80 text-white' : 'bg-gradient-to-br from-pink-200/80 via-yellow-100/80 to-blue-200/80 text-gray-900'}`}>
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className={`max-w-2xl w-full p-8 rounded-lg shadow-lg backdrop-blur-md ${theme === 'dark' ? 'bg-gradient-to-br from-indigo-900/80 via-gray-900/80 to-purple-900/80 text-white' : 'bg-gradient-to-br from-pink-200/80 via-yellow-100/80 to-blue-200/80 text-gray-900'}`}>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Edit Profile</h1>
            <p className="text-gray-600 mt-1">Update your professional information and preferences</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-8">
            {/* Success/Error Messages */}
            {submitStatus === 'success' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-green-800 font-medium">Profile updated successfully!</span>
                </div>
              </div>
            )}

            {submitStatus === 'error' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span className="text-red-800 font-medium">Failed to update profile. Please try again.</span>
                </div>
              </div>
            )}

            {/* Basic Information */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Basic Information</h2>
              
              <ImageUpload
                currentImage={formData.avatar_url}
                onImageChange={handleImageChange}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  label="Username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  error={validation.username?.message}
                  required
                  maxLength={20}
                />
                
                <FormField
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  error={validation.email?.message}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  label="Full Name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  error={validation.name?.message}
                  required
                  maxLength={50}
                />
                
                <FormField
                  label="Professional Title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  error={validation.title?.message}
                  required
                  maxLength={100}
                />
              </div>

              <FormField
                label="Location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                onBlur={handleBlur}
                error={validation.location?.message}
                maxLength={100}
              />

              <FormField
                label="Bio"
                name="bio"
                type="textarea"
                value={formData.bio}
                onChange={handleInputChange}
                onBlur={handleBlur}
                error={validation.bio?.message}
                maxLength={500}
                rows={4}
              />

              <SkillsInput
                skills={formData.skills}
                onSkillsChange={handleSkillsChange}
              />
            </div>

            {/* Experience */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Experience</h2>
                <button
                  type="button"
                  onClick={addExperience}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                >
                  Add Experience
                </button>
              </div>

              {formData.experience.map((exp, index) => (
                <div key={exp.id} className="border border-gray-200 rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900">Experience {index + 1}</h3>
                    <button
                      type="button"
                      onClick={() => removeExperience(index)}
                      className="text-red-600 hover:text-red-800 focus:outline-none"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Job Title"
                      value={exp.title}
                      onChange={(e) => updateExperience(index, 'title', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="Company"
                      value={exp.company}
                      onChange={(e) => updateExperience(index, 'company', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input
                      type="date"
                      value={exp.start_date}
                      onChange={(e) => updateExperience(index, 'start_date', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="date"
                      value={exp.end_date || ''}
                      onChange={(e) => updateExperience(index, 'end_date', e.target.value || undefined)}
                      disabled={exp.current}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={exp.current}
                        onChange={(e) => updateExperience(index, 'current', e.target.checked)}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Current Position</span>
                    </label>
                  </div>

                  <textarea
                    placeholder="Description"
                    value={exp.description}
                    onChange={(e) => updateExperience(index, 'description', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
            </div>

            {/* Education */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Education</h2>
                <button
                  type="button"
                  onClick={addEducation}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                >
                  Add Education
                </button>
              </div>

              {formData.education.map((edu, index) => (
                <div key={edu.id} className="border border-gray-200 rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900">Education {index + 1}</h3>
                    <button
                      type="button"
                      onClick={() => removeEducation(index)}
                      className="text-red-600 hover:text-red-800 focus:outline-none"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="School/University"
                      value={edu.school}
                      onChange={(e) => updateEducation(index, 'school', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="Degree"
                      value={edu.degree}
                      onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <input
                    type="text"
                    placeholder="Field of Study"
                    value={edu.field}
                    onChange={(e) => updateEducation(index, 'field', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input
                      type="date"
                      value={edu.start_date}
                      onChange={(e) => updateEducation(index, 'start_date', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="date"
                      value={edu.end_date || ''}
                      onChange={(e) => updateEducation(index, 'end_date', e.target.value || undefined)}
                      disabled={edu.current}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={edu.current}
                        onChange={(e) => updateEducation(index, 'current', e.target.checked)}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Currently Studying</span>
                    </label>
                  </div>
                </div>
              ))}
            </div>

            {/* Social Links */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Social Links</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  label="LinkedIn"
                  name="linkedin"
                  type="url"
                  value={formData.social_links.linkedin || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    social_links: { ...prev.social_links, linkedin: e.target.value }
                  }))}
                  placeholder="https://linkedin.com/in/yourprofile"
                />
                
                <FormField
                  label="Twitter"
                  name="twitter"
                  type="url"
                  value={formData.social_links.twitter || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    social_links: { ...prev.social_links, twitter: e.target.value }
                  }))}
                  placeholder="https://twitter.com/yourhandle"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  label="GitHub"
                  name="github"
                  type="url"
                  value={formData.social_links.github || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    social_links: { ...prev.social_links, github: e.target.value }
                  }))}
                  placeholder="https://github.com/yourusername"
                />
                
                <FormField
                  label="Website"
                  name="website"
                  type="url"
                  value={formData.social_links.website || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    social_links: { ...prev.social_links, website: e.target.value }
                  }))}
                  placeholder="https://yourwebsite.com"
                />
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => window.history.back()}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileEdit; 