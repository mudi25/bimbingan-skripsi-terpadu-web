export const DefaultImageUrl =
  "https://storage.googleapis.com/bimbimngan-skripsi-terpadu.appspot.com/profil.png";
export interface UserModel {
  id: string;
  username: string;
  password: string;
  nama: string;
  alamat: string;
  nomorHp: string;
  jurusan: string;
  fakultas: string;
  roles: "DOSEN" | "MAHASISWA" | "ADMIN";
  imageUrl: string;
  fcmToken: string | null;
  timestamp: number;
}
export interface Jadwal {
  id: string;
  idSkripsi: string;
  keterangan: string;
  mahasiswa: string;
  pembimbing: string;
  query: string[];
  timestamp: number;
}
export interface SkripsiModel {
  id: string;
  judul: string;
  pembimbing1: string;
  pembimbing2: string;
  mahasiswa: string;
  query: string[];
  jadwal: { [key: string]: Jadwal };
  timestamp: number;
}
export interface Chat {
  id: string;
  message: string;
  timestamp: number;
  sendBy: string;
}
