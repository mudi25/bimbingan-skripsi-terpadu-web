import React from "react";
import MaterialTable from "material-table";
import { useCollection } from "react-firebase-hooks/firestore";
import LinearProgress from "@material-ui/core/LinearProgress";
import { UserModel, SkripsiModel, Jadwal } from "../model";
import { v4 as uuid } from "uuid";
import firebase from "firebase";
export default function SkripsiPage() {
  const firestore = firebase.apps[0].firestore();
  const collectionUser = firestore.collection("user");
  const collectionSkripsi = firestore.collection("skripsi");
  const [prosesSendNotif, setProsesSendNotif] = React.useState(false);
  const [snapshot, loading, error] = useCollection(collectionSkripsi);
  const add = async (newData: SkripsiModel) => {
    try {
      const [mahasiswaSnapshot, pembimbing1Snapshot, pembimbing2Snapshot] =
        await Promise.all([
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
          newData.query = [
            newData.mahasiswa,
            newData.pembimbing1,
            newData.pembimbing2,
          ];
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
      newData.query = [
        newData.mahasiswa,
        newData.pembimbing1,
        newData.pembimbing2,
      ];

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
      const [mahasiswaSnapshot, pembimbing1Snapshot, pembimbing2Snapshot] =
        await Promise.all([
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
  const sendNotif = async () => {
    try {
      if (prosesSendNotif === true) return;
      setProsesSendNotif(true);
      const snap = await firebase.firestore().collection("jadwal").get();
      if (snap.empty === true) {
        setProsesSendNotif(false);
        return;
      }
      const now = new Date();
      const items: Jadwal[] = [];

      for (const jadwalSnap of snap.docs) {
        const jadwal = jadwalSnap.data() as Jadwal;
        const timestamp = new Date(jadwal.timestamp);

        if (
          timestamp.getFullYear() === now.getFullYear() &&
          timestamp.getMonth() === now.getMonth() &&
          timestamp.getDate() === now.getDate()
        ) {
          items.push(jadwal);
        }
      }
      const refs = [];
      for (const it of items) {
        refs.push(firestore.collection("user").doc(it.mahasiswa));
        refs.push(firestore.collection("user").doc(it.pembimbing));
      }
      const users = await Promise.all(refs.map((it) => it.get()));
      const token: string[] = [];
      for (const it of users) {
        const fcmToken = it.get("fcmToken");
        console.log(it);
        if (fcmToken) {
          token.push(fcmToken);
        }
      }
      const body = {
        token: token,
        body: "jadwal konsul hari ini",
        title: "informasi",
      };
      const response = await fetch(
        "https://bimbingan-api.herokuapp.com/send-message",
        {
          method: "POST", // *GET, POST, PUT, DELETE, etc.
          mode: "cors", // no-cors, *cors, same-origin
          cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
          headers: {
            "Content-Type": "application/json",
          },
          redirect: "follow", // manual, *follow, error
          referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
          body: JSON.stringify(body), // body data type must match "Content-Type" header
        }
      );
      console.log(response);
    } catch (error) {
      alert(String(error.message));
    }
    setProsesSendNotif(false);
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
            {
              icon: "info",
              tooltip: "Informasi",
              isFreeAction: true,
              onClick: async () => sendNotif(),
            },
          ]}
          title="Skripsi"
        />
      )}
    </div>
  );
}
