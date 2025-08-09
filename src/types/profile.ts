export interface ProfileData {
  id: string;
  nickname: string;
  selfIntroduction: string | null;
  profileImageUrl: string | null;
  gratitudePoints: number;
  currentTreeStage: string;
  user: {
    name: string | null;
    image: string | null;
  };
}
