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
  fcmToken: string | null;
  timestamp: number;
}
export interface Jadwal {
  timestamp: number;
  keterangan: string;
}
export interface SkripsiModel {
  id: string;
  judul: string;
  pembimbing1: string;
  pembimbing2: string;
  mahasiswa: string;
  jadwal: { [key: string]: Jadwal };
  timestamp: number;
}
export interface Chat {
  id: string;
  message: string;
  timestamp: number;
  sendBy: string;
}
