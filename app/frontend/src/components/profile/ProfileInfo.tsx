import React, { useState } from 'react';
import type { Profile } from '../../types';

interface ProfileInfoProps {
  profile: Profile;
}

export const ProfileInfo: React.FC<ProfileInfoProps> = ({ profile }) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['bio', 'skills']));

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short'
    });
  };

  const formatDateRange = (startDate: string, endDate?: string, current?: boolean) => {
    const start = formatDate(startDate);
    if (current || !endDate) {
      return `${start} - Present`;
    }
    return `${start} - ${formatDate(endDate)}`;
  };

  const SectionHeader: React.FC<{ title: string; section: string; children?: React.ReactNode }> = ({
    title,
    section,
    children
  }) => (
    <button
      onClick={() => toggleSection(section)}
      className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors rounded-t-lg"
    >
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <div className="flex items-center space-x-2">
        {children}
        <svg
          className={`w-5 h-5 text-gray-500 transition-transform ${
            expandedSections.has(section) ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </button>
  );

  return (
    <div className="space-y-6">
      {/* Bio Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <SectionHeader title="About" section="bio">
          <span className="text-sm text-gray-500">Bio</span>
        </SectionHeader>
        {expandedSections.has('bio') && (
          <div className="p-4 border-t border-gray-200">
            <p className="text-gray-700 leading-relaxed">{profile.bio}</p>
          </div>
        )}
      </div>

      {/* Skills Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <SectionHeader title="Skills" section="skills">
          <span className="text-sm text-gray-500">{profile.skills.length} skills</span>
        </SectionHeader>
        {expandedSections.has('skills') && (
          <div className="p-4 border-t border-gray-200">
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Experience Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <SectionHeader title="Experience" section="experience">
          <span className="text-sm text-gray-500">{profile.experience.length} positions</span>
        </SectionHeader>
        {expandedSections.has('experience') && (
          <div className="border-t border-gray-200">
            {profile.experience.map((exp, index) => (
              <div key={exp.id} className={`p-4 ${index !== profile.experience.length - 1 ? 'border-b border-gray-100' : ''}`}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{exp.title}</h4>
                    <p className="text-blue-600 font-medium">{exp.company}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {formatDateRange(exp.start_date, exp.end_date, exp.current)}
                    </p>
                    <p className="text-gray-700 mt-2 leading-relaxed">{exp.description}</p>
                  </div>
                  {exp.current && (
                    <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                      Current
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Education Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <SectionHeader title="Education" section="education">
          <span className="text-sm text-gray-500">{profile.education.length} degrees</span>
        </SectionHeader>
        {expandedSections.has('education') && (
          <div className="border-t border-gray-200">
            {profile.education.map((edu, index) => (
              <div key={edu.id} className={`p-4 ${index !== profile.education.length - 1 ? 'border-b border-gray-100' : ''}`}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{edu.degree}</h4>
                    <p className="text-blue-600 font-medium">{edu.school}</p>
                    <p className="text-gray-600">{edu.field}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {formatDateRange(edu.start_date, edu.end_date, edu.current)}
                    </p>
                  </div>
                  {edu.current && (
                    <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                      Current
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Contact Information */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <SectionHeader title="Contact Information" section="contact">
          <span className="text-sm text-gray-500">Details</span>
        </SectionHeader>
        {expandedSections.has('contact') && (
          <div className="p-4 border-t border-gray-200">
            <div className="space-y-3">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="text-gray-700">Available for opportunities</span>
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-gray-700">{profile.location}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 