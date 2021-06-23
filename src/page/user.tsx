import React from "react";
import MaterialTable from "material-table";
import firebase from "firebase";
import { useCollection } from "react-firebase-hooks/firestore";
import LinearProgress from "@material-ui/core/LinearProgress";
import { DefaultImageUrl, FAKULTAS, JURURSAN, UserModel } from "../model";
import { v4 as uuid } from "uuid";
export default function UserPage() {
  const firestore = firebase.apps[0].firestore();
  const collectionRef = firestore.collection("user");
  const [snapshot, loading, error] = useCollection(collectionRef);
  const add = async (newData: UserModel) => {
    try {
      const id = uuid();
      newData.id = id;
      newData.timestamp = Date.now();
      newData.fcmToken = null;
      newData.imageUrl = DefaultImageUrl;
      await collectionRef.doc(id).set(newData);
    } catch (error) {
      alert(error);
    }
  };
  const update = async (newData: UserModel, oldData: UserModel | undefined) => {
    try {
      newData.timestamp = Date.now();
      if (oldData) {
        await collectionRef.doc(oldData.id).update(newData);
      }
    } catch (error) {
      alert(error);
    }
  };
  const deletes = async (oldData: UserModel) => {
    try {
      await collectionRef.doc(oldData.id).delete();
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
            { title: "ID", field: "id", editable: "never" },
            { title: "Username", field: "username" },
            { title: "Password", field: "password" },
            { title: "Nama", field: "nama" },
            { title: "Alamat", field: "alamat" },
            { title: "Nomor Hp", field: "nomorHp" },

            {
              title: "Fakultas",
              field: "fakultas",
              lookup: FAKULTAS,
            },
            {
              title: "Jurusan",
              field: "jurusan",
              lookup: JURURSAN,
            },
            {
              title: "Roles",
              field: "roles",
              lookup: { DOSEN: "DOSEN", MAHASISWA: "MAHASISWA" },
            },
          ]}
          data={snapshot.docs.map((it) => it.data() as UserModel)}
          editable={{
            onRowAdd: (newData) => add(newData),
            onRowUpdate: (newData, oldData) => update(newData, oldData),
            onRowDelete: (oldData) => deletes(oldData),
          }}
          title="User"
        />
      )}
    </div>
  );
}
