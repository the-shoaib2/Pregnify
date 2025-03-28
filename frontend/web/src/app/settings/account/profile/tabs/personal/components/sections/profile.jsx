import EducationCard from './education/education'; // Adjust the import path as necessary

export default function ProfileSection() {
  return (
    <div>
      {/* Other profile sections */}
      <EducationCard educationData={initialEducationData} handleChange={handleProfileChange} />
    </div>
  );
}