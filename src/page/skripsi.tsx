import React from "react";
import MaterialTable from "material-table";
import { useCollection } from "react-firebase-hooks/firestore";
import LinearProgress from "@material-ui/core/LinearProgress";
import { UserModel, SkripsiModel } from "../model";
import { v4 as uuid } from "uuid";
import firebase from "firebase";
export default function SkripsiPage() {
  const firestore = firebase.apps[0].firestore();
  const collectionUser = firestore.collection("user");
  const collectionSkripsi = firestore.collection("skripsi");
  const [snapshot, loading, error] = useCollection(collectionSkripsi);
  const add = async (newData: SkripsiModel) => {
    try {
      const [
        mahasiswaSnapshot,
        pembimbing1Snapshot,
        pembimbing2Snapshot,
      ] = await Promise.all([
        collectionUser
          .where("username", "==", newData.mahasiswa)
          .limit(1)
          .get(),
        collectionUser
          .where("username", "==", newData.pembimbing1)
          .limit(1)
          .get(),
        collectionUser
          .where("username", "==", newData.pembimbing2)
          .limit(1)
          .get(),
      ]);
      if (
        mahasiswaSnapshot.empty === false &&
        pembimbing1Snapshot.empty === false &&
        pembimbing2Snapshot.empty === false
      ) {
        const mahasiswa = mahasiswaSnapshot.docs[0].data() as UserModel;
        const pembimbing1 = pembimbing1Snapshot.docs[0].data() as UserModel;
        const pembimbing2 = pembimbing2Snapshot.docs[0].data() as UserModel;
        if (
          mahasiswa.roles === "MAHASISWA" &&
          pembimbing1.roles === "DOSEN" &&
          pembimbing2.roles === "DOSEN"
        ) {
          const id = uuid();
          newData.id = id;
          newData.mahasiswa = mahasiswa.id;
          newData.pembimbing1 = pembimbing1.id;
          newData.pembimbing2 = pembimbing2.id;
          newData.timestamp = Date.now();
          newData.jadwal = {};
          await collectionSkripsi.doc(newData.id).set(newData);
          return;
        }
        throw new Error("pastikan data mahasiswa dan dosen sudah benar");
      }
      throw new Error("data mahasiswa atau dosen tidak ditemukan");
    } catch (error) {
      alert(error.message);
    }
  };
  const update = async (
    newData: SkripsiModel,
    oldData: SkripsiModel | undefined
  ) => {
    try {
      newData.timestamp = Date.now();
      if (oldData) {
        await collectionSkripsi.doc(oldData.id).update(newData);
      }
    } catch (error) {
      alert(error);
    }
  };
  const deletes = async (oldData: SkripsiModel) => {
    try {
      await collectionSkripsi.doc(oldData.id).delete();
    } catch (error) {
      alert(error);
    }
  };
  const information = async (data: SkripsiModel | SkripsiModel[]) => {
    try {
      data = Array.isArray(data) ? data[0] : data;
      const [
        mahasiswaSnapshot,
        pembimbing1Snapshot,
        pembimbing2Snapshot,
      ] = await Promise.all([
        collectionUser.doc(data.mahasiswa).get(),
        collectionUser.doc(data.pembimbing1).get(),
        collectionUser.doc(data.pembimbing2).get(),
      ]);
      if (
        mahasiswaSnapshot.exists === true &&
        pembimbing1Snapshot.exists === true &&
        pembimbing2Snapshot.exists === true
      ) {
        const mahasiswa = mahasiswaSnapshot.data() as UserModel;
        const pembimbing1 = pembimbing1Snapshot.data() as UserModel;
        const pembimbing2 = pembimbing2Snapshot.data() as UserModel;
        const txtMahasiswa = `Mahasiswa\nNIM: ${mahasiswa.username}\nNama: ${mahasiswa.nama}\nNo Hp: ${mahasiswa.nomorHp}`;
        const txtPembimbing1 = `Pembimbing 1\nNIDN: ${pembimbing1.username}\nNama: ${pembimbing1.nama}\nNo Hp: ${pembimbing1.nomorHp}`;
        const txtPembimbing2 = `Pembimbing 2\nNIDN: ${pembimbing2.username}\nNama: ${pembimbing2.nama}\nNo Hp: ${pembimbing2.nomorHp}`;
        alert(`${txtMahasiswa}\n\n\n${txtPembimbing1}\n\n\n${txtPembimbing2}`);
        return;
      }
      throw new Error("data mahasiswa atau dosen tidak ditemukan");
    } catch (error) {
      alert(error);
    }
  };
  return (
    <div>
      {loading && <LinearProgress />}
      {error && <p>{error.message}</p>}
      {error && <p>{error.message}</p>}
      {snapshot && (
        <MaterialTable
          columns={[
            { title: "id", field: "id", editable: "never" },
            { title: "judul", field: "judul" },
            { title: "pembimbing 1", field: "pembimbing1" },
            { title: "pembimbing 2", field: "pembimbing2" },
            { title: "mahasiswa", field: "mahasiswa" },
          ]}
          data={snapshot.docs.map((it) => it.data() as SkripsiModel)}
          editable={{
            onRowAdd: (newData) => add(newData),
            onRowUpdate: (newData, oldData) => update(newData, oldData),
            onRowDelete: (oldData) => deletes(oldData),
          }}
          actions={[
            {
              icon: "info",
              tooltip: "Informasi",
              onClick: async (_, rowData) => information(rowData),
            },
          ]}
          title="Skripsi"
        />
      )}
    </div>
  );
}
