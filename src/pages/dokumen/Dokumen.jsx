import React, { useCallback, useEffect, useMemo, useState } from "react";
import Breadcrumb from "../../components/Breadcrumbs/Breadcrumb";
import Select from "react-select";
import DataTable from "react-data-table-component";
import {
  dataDistribusiBekasi,
  dataKecamatan,
  dataKota,
  dataProvinsi,
} from "../../data/data";
import { encryptId, selectThemeColors } from "../../data/utils";
import {
  FaDownload,
  FaEdit,
  FaEye,
  FaPlus,
  FaSearch,
  FaTrash,
} from "react-icons/fa";
import { BiExport, BiSolidFileExport } from "react-icons/bi";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import Swal from "sweetalert2";
import { CgSpinner } from "react-icons/cg";
import ModalTTE from "../../components/Modal/ModalTTE";

const Dokumen = () => {
  const user = useSelector((a) => a.auth.user);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState("");
  const [filteredData, setFilteredData] = useState([]);

  const [data, setData] = useState([]);
  const [getLoading, setGetLoading] = useState(false);

  const [dataUser, setDataUser] = useState([]);
  const [dataProvinsi, setDataProvinsi] = useState([]);
  const [dataKota, setDataKota] = useState([]);
  const [dataKecamatan, setDataKecamatan] = useState([]);

  const [selectedProvinsi, setSelectedProvinsi] = useState(null);
  const [selectedKota, setSelectedKota] = useState(null);
  const [selectedKecamatan, setSelectedKecamatan] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [jsonData, setJsonData] = useState({
    id: "",
    nama_dokumen: "",
  });
  const handleTTE = async (e, id, nama_dokumen) => {
    e.preventDefault();
    setShowModal(true);
    setJsonData({
      id: id,
      nama_dokumen: nama_dokumen,
    });
  };

  const fetchDokumenData = async () => {
    setLoading(true);
    setError(false);
    try {
      const response = await axios({
        method: "get",
        url: `${import.meta.env.VITE_APP_API_URL}/api/dokumen`,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
      });
      setData(response.data.data);
      setFilteredData(response.data.data);
    } catch (error) {
      setError(true);
      setFilteredData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDokumenData();
  }, []);

  const fetchUserData = useCallback(async () => {
    setGetLoading(true);
    try {
      const responseUser = await axios({
        method: "get",
        url: `${import.meta.env.VITE_APP_API_URL}/api/me`,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
      });

      setDataUser(responseUser.data.data);
    } catch (error) {
      console.log(error);
    } finally {
      setGetLoading(false);
    }
  }, [user?.token]);

  // Fetch provinces only if dataProvinsi is empty
  const fetchProvinsi = useCallback(async () => {
    if (dataProvinsi.length > 0) return;

    try {
      const response = await axios({
        method: "get",
        url: `${import.meta.env.VITE_APP_API_URL}/api/provinsi`,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
      });

      setDataProvinsi([
        { label: "Semua Provinsi", value: "" },
        ...response.data.data.map((item) => ({
          label: item.name,
          value: item.id,
        })),
      ]);
    } catch (error) {
      setError(true);
      setDataProvinsi([]);
    }
  }, [dataProvinsi.length, user?.token]);

  // Fetch cities based on the selected province
  const fetchKota = useCallback(
    async (idProvinsi) => {
      if (dataKota.length > 0 && selectedProvinsi?.value === idProvinsi) return;

      try {
        const response = await axios({
          method: "get",
          url: `${
            import.meta.env.VITE_APP_API_URL
          }/api/getkabupaten/${idProvinsi}`,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user?.token}`,
          },
        });

        setDataKota([
          { label: "Semua Kabupaten/Kota", value: "" },
          ...response.data.data.map((item) => ({
            label: item.name,
            value: item.id,
          })),
        ]);
      } catch (error) {
        setError(true);
        setDataKota([]);
      }
    },
    [dataKota.length, selectedProvinsi?.value, user?.token]
  );

  // Fetch subdistricts based on the selected city
  const fetchKecamatan = useCallback(
    async (idKota) => {
      if (dataKecamatan.length > 0 && selectedKota?.value === idKota) return;

      try {
        const response = await axios({
          method: "get",
          url: `${import.meta.env.VITE_APP_API_URL}/api/getkecamatan/${idKota}`,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user?.token}`,
          },
        });

        setDataKecamatan([
          { label: "Semua Kecamatan", value: "" },
          ...response.data.data.map((item) => ({
            label: item.name,
            value: item.id,
          })),
        ]);
      } catch (error) {
        setError(true);
        setDataKecamatan([]);
      }
    },
    [dataKecamatan.length, selectedKota?.value, user?.token]
  );
  useEffect(() => {
    fetchProvinsi();
    fetchUserData();
  }, []);

  const handleProvinsiChange = (selectedOption) => {
    setSelectedProvinsi(selectedOption);
    setSelectedKota(null);
    setSelectedKecamatan(null);
    setDataKota([]);
    setDataKecamatan([]);
    if (selectedOption && selectedOption.value !== "") {
      fetchKota(selectedOption.value);
    }
  };

  const handleKotaChange = (selectedOption) => {
    setSelectedKota(selectedOption);
    setSelectedKecamatan(null);
    setDataKecamatan([]);
    if (selectedOption && selectedOption.value !== "") {
      fetchKecamatan(selectedOption.value);
    }
  };

  const handleKecamatanChange = (selectedOption) => {
    setSelectedKecamatan(selectedOption);
  };

  const deleteDokumen = async (id) => {
    await axios({
      method: "delete",
      url: `${import.meta.env.VITE_APP_API_URL}/api/dokumen/${id}`,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user?.token}`,
      },
    })
      .then(() => {
        fetchDokumenData();
      })
      .catch((error) => {
        console.log(error);
      });
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleConfirmDeleteDokumen = async (id) => {
    return Swal.fire({
      title: "Are you sure?",
      text: "You will Delete This Dokumen!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      confirmButtonColor: "#16B3AC",
    }).then(async (result) => {
      if (result.value) {
        await deleteDokumen(id);
        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "Your Dokumen has been deleted.",
        });
      }
    });
  };

  const handleSearch = (event) => {
    const value = event.target.value.toLowerCase();
    setSearch(value);

    const filtered = data.filter((item) => {
      return (
        (item?.nama_dokumen &&
          item.nama_dokumen.toLowerCase().includes(value)) ||
        (item?.nomor_bast && item.nomor_bast.toLowerCase().includes(value)) ||
        (item?.tanggal_bast &&
          item.tanggal_bast.toLowerCase().includes(value)) ||
        (item?.tahun_lokus && item.tahun_lokus.toLowerCase().includes(value)) ||
        (item?.penerima_hibah &&
          item.penerima_hibah.toLowerCase().includes(value))
      );
    });

    setFilteredData(filtered);
  };

  const handleSearchClick = async () => {
    setLoading(true);
    setError(false);

    try {
      const response = await axios({
        method: "post",
        url: `${import.meta.env.VITE_APP_API_URL}/api/searchdoc`,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
        data: {
          id_provinsi: selectedProvinsi?.value.toString() || "",
          id_kabupaten: selectedKota?.value.toString() || "",
          id_kecamatan: selectedKecamatan?.value.toString() || "",
        },
      });

      setFilteredData(response.data.data);
    } catch (error) {
      setError(true);
      setFilteredData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user.role === "3") {
      fetchUserData();
    }
  }, [user.role, fetchUserData]);

  // Fetch provinces and cities based on selected options
  useEffect(() => {
    fetchProvinsi();
    if (selectedProvinsi) {
      fetchKota(selectedProvinsi.value);
    }
  }, [fetchProvinsi, selectedProvinsi, fetchKota]);

  // Fetch subdistricts based on the selected city
  useEffect(() => {
    if (selectedKota) {
      fetchKecamatan(selectedKota.value);
    }
  }, [selectedKota, fetchKecamatan]);

  // Set selected options for provinces and cities based on user's initial data
  useEffect(() => {
    if (user.role === "3" && user.provinsi && dataProvinsi.length > 0) {
      const initialOption = dataProvinsi.find(
        (prov) => prov.value == user.provinsi
      );
      if (initialOption) {
        setSelectedProvinsi({
          label: initialOption.label,
          value: initialOption.value,
        });
      }
    }
    if (user.role === "3" && user.kabupaten && dataKota.length > 0) {
      const initialOption = dataKota.find(
        (prov) => prov.value == user.kabupaten
      );
      if (initialOption) {
        setSelectedKota({
          label: initialOption.label,
          value: initialOption.value,
        });
      }
    }
  }, [user.role, user.provinsi, user.kabupaten, dataProvinsi, dataKota]);

  const columns = useMemo(
    () => [
      // { name: "No", selector: (row) => row.id, sortable: true },
      {
        name: "Nama Dokumen",
        selector: (row) => row.nama_dokumen,
        sortable: true,
        width: "200px",
      },
      {
        name: "Provinsi",
        selector: (row) => row.provinsi,
        sortable: true,
        width: "120px",
      },
      {
        name: "Kab/Kota",
        selector: (row) => row.kabupaten,
        sortable: true,
      },
      {
        name: "Nomor BAST",
        selector: (row) => row.nomor_bast,
        sortable: true,
        // width: "100px",
      },
      // {
      //   name: "Tanggal BAST",
      //   selector: (row) => row.tanggal_bast,
      //   sortable: true,
      //   // width: "100px",
      // },
      {
        name: "Tahun Lokus",
        selector: (row) => row.tahun_lokus,
        sortable: true,
        // width: "100px",
      },
      // {
      //   name: "Kepala Unit Pemberi",
      //   selector: (row) => row.kepala_unit_pemberi,
      //   sortable: true,
      //   // width: "100px",
      // },
      // {
      //   name: "Penerima Hibah",
      //   selector: (row) => row.penerima_hibah,
      //   sortable: true,
      //   // width: "100px",
      // },
      {
        name: "Status TTE",
        cell: (row) =>
          user.role === "2" ? (
            row.status_tte === "1" ? (
              <div className="p-2 bg-red-500 rounded-md text-white">
                Belum TTE
              </div>
            ) : row.status_tte === "2" ? (
              <div className="p-2 bg-green-500 rounded-md text-white">
                Sudah TTE
              </div>
            ) : (
              <div className="p-2 bg-yellow-500 rounded-md text-white">
                Daerah Belum TTE
              </div>
            )
          ) : user.role === "3" ? (
            row.status_tte === "0" ? (
              <div className="p-2 bg-red-500 rounded-md text-white">
                Belum TTE
              </div>
            ) : (
              <div className="p-2 bg-green-500 rounded-md text-white">
                Sudah TTE
              </div>
            )
          ) : user.role === "1" ? (
            row.status_tte === "2" ? (
              <div className="p-2 bg-green-500 rounded-md text-white">
                Sudah TTE
              </div>
            ) : row.status_tte === "1" ? (
              <div className="p-2 bg-yellow-500 rounded-md text-white">
                PPK Belum TTE
              </div>
            ) : (
              <div className="p-2 bg-red-500 rounded-md text-white">
                Belum TTE
              </div>
            )
          ) : (
            ""
          ),
        sortable: true,
        selector: (row) => row.status_tte,

        // width: "110px",
      },
      // {
      //   name: "Keterangan PPK Kemenkes",
      //   selector: (row) => row.keterangan_ppk,
      //   sortable: true,
      // },
      {
        name: "Dokumen BAST",
        cell: (row) => (
          <div className="flex items-center space-x-2">
            {/* <button
              title="Input"
              className="text-green-500 hover:text-green-700"
            >
              <Link to="/data-verifikasi/form-distribusi">
                <FaPlus />
              </Link>
            </button> */}
            <button
              title="Lihat"
              className="text-[#16B3AC] hover:text-cyan-500"
            >
              <Link
                to={`/dokumen/preview-dokumen/${encodeURIComponent(
                  encryptId(row.id)
                )}`}
              >
                <FaEye size={16} />
              </Link>
            </button>
            <button
              title="Download"
              className="text-green-400 hover:text-green-500"
            >
              <Link
                to={`/dokumen/preview-dokumen/${encodeURIComponent(
                  encryptId(row.id)
                )}`}
              >
                <FaDownload size={16} />
              </Link>
            </button>
          </div>
        ),
        ignoreRowClick: true,
        allowOverflow: true,
        button: true,
      },
      {
        name: "TTE",
        cell: (row) => (
          <div className="flex items-center space-x-2 font-semibold">
            {user.role === "2" ? (
              row.status_tte === "1" ? (
                <button
                  title="TTE"
                  className="text-white py-2 w-22 bg-teal-500 rounded-md"
                  onClick={() => {
                    navigate(
                      `/dokumen/preview-dokumen/${encodeURIComponent(
                        encryptId(row.id)
                      )}`
                    );
                  }}
                >
                  <Link
                    to={`/dokumen/preview-dokumen/${encodeURIComponent(
                      encryptId(row.id)
                    )}`}
                  >
                    TTE
                  </Link>
                </button>
              ) : row.status_tte === "2" ? (
                <button
                  title="TTE"
                  className="text-white  py-2 w-22 bg-green-500 rounded-md"
                  onClick={() => {
                    navigate(
                      `/dokumen/preview-dokumen/${encodeURIComponent(
                        encryptId(row.id)
                      )}`
                    );
                  }}
                >
                  <Link
                    to={`/dokumen/preview-dokumen/${encodeURIComponent(
                      encryptId(row.id)
                    )}`}
                  >
                    Sudah TTE
                  </Link>
                </button>
              ) : (
                <button
                  title="Pending"
                  className="text-white py-2 w-22 bg-yellow-500 rounded-md"
                >
                  Daerah Belum TTE
                </button>
              )
            ) : user.role === "3" ? (
              row.status_tte === "0" ? (
                <button
                  title="TTE"
                  className="text-white py-2 w-22 bg-teal-500 rounded-md"
                  onClick={() => {
                    navigate(
                      `/dokumen/preview-dokumen/${encodeURIComponent(
                        encryptId(row.id)
                      )}`
                    );
                  }}
                >
                  <Link
                    to={`/dokumen/preview-dokumen/${encodeURIComponent(
                      encryptId(row.id)
                    )}`}
                  >
                    TTE
                  </Link>
                </button>
              ) : (
                // <button
                //   title="TTE"
                //   className="text-white py-2 w-22 bg-teal-500 rounded-md"
                //   onClick={(e) => handleTTE(e, row.id, row.nama_dokumen)}
                // >
                //   TTE
                // </button>
                <button
                  title="TTE"
                  className="text-white  py-2 w-22 bg-green-500 rounded-md"
                  onClick={() => {
                    navigate(
                      `/dokumen/preview-dokumen/${encodeURIComponent(
                        encryptId(row.id)
                      )}`
                    );
                  }}
                >
                  <Link
                    to={`/dokumen/preview-dokumen/${encodeURIComponent(
                      encryptId(row.id)
                    )}`}
                  >
                    Sudah TTE
                  </Link>
                </button>
              )
            ) : (
              ""
            )}
            {user.role === "1" ? (
              <button
                title="TTE"
                className="text-white py-2 w-22 bg-teal-500 rounded-md"
                onClick={() => {
                  navigate(
                    `/dokumen/preview-dokumen/${encodeURIComponent(
                      encryptId(row.id)
                    )}`
                  );
                }}
              >
                <Link
                  to={`/dokumen/preview-dokumen/${encodeURIComponent(
                    encryptId(row.id)
                  )}`}
                >
                  Detail
                </Link>
              </button>
            ) : (
              ""
            )}
          </div>
        ),
        ignoreRowClick: true,
        allowOverflow: true,
        button: true,
      },
      {
        name: "Aksi",
        omit: user.role !== "1",
        cell: (row) => (
          <div className="flex items-center space-x-2">
            {/* <button
              title="Input"
              className="text-green-500 hover:text-green-700"
            >
              <Link to="/data-verifikasi/form-distribusi">
                <FaPlus />
              </Link>
            </button> */}

            {user.role === "1" ? (
              <>
                <button
                  title="Edit"
                  className="text-[#16B3AC] hover:text-cyan-500"
                >
                  <Link
                    to={`/dokumen/edit/${encodeURIComponent(
                      encryptId(row.id)
                    )}`}
                  >
                    <FaEdit size={16} />
                  </Link>
                </button>
                <button
                  title="Delete"
                  className="text-red-500 hover:text-red-700"
                  onClick={() => handleConfirmDeleteDokumen(row.id)}
                >
                  <FaTrash size={16} />
                </button>
              </>
            ) : (
              ""
            )}
            {/* <button
              title="Edit"
              className="text-white p-2 bg-blue-600 rounded-md"
            >
              <Link to={`/dokumen/preview-dokumen/${encodeURIComponent(
                  encryptId(row.id)
                )}`}>
                TTE
              </Link>
            </button> */}
          </div>
        ),
        ignoreRowClick: true,
        allowOverflow: true,
        button: true,
      },
    ],
    []
  );

  const handleExport = () => {
    // Implementasi untuk mengekspor data (misalnya ke CSV)
  };
  if (getLoading) {
    return (
      <div className="flex justify-center items-center">
        <CgSpinner className="animate-spin inline-block w-8 h-8 text-teal-400" />
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  return (
    <div>
      <Breadcrumb pageName="Dokumen TTE" linkBack="/dokumen" />
      <div className="flex flex-col items-center justify-center w-full tracking-tight mb-12">
        <h1 className="font-normal mb-3 text-xl lg:text-[28px] tracking-tight text-center text-bodydark1">
          SELAMAT DATANG{" "}
          {user.role === "1"
            ? "ADMIN PUSAT"
            : user.role === "2"
            ? "ADMIN PPK"
            : user.role === "3"
            ? `ADMIN KAB/KOTA`
            : ""}
        </h1>
        <div className="flex items-center lg:items-end mt-8 gap-4 flex-col lg:flex-row">
          <div className="flex items-center gap-4 flex-col sm:flex-row">
            <div className="text-base">
              <label
                className="block text-[#728294] text-base font-normal mb-2"
                htmlFor="email"
              >
                Provinsi
              </label>
              <Select
                options={dataProvinsi}
                value={selectedProvinsi}
                onChange={handleProvinsiChange}
                className="w-64 sm:w-32 xl:w-60 bg-slate-500 my-react-select-container"
                classNamePrefix="my-react-select"
                placeholder="Pilih Provinsi"
                theme={(theme) => ({
                  ...theme,
                  colors: {
                    ...theme.colors,
                    primary25: "lightgrey",
                    primary: "grey",
                  },
                })}
                isDisabled={user.role === "3"}
              />
            </div>
            <div>
              <label
                className="block text-[#728294] text-base font-normal mb-2"
                htmlFor="kota"
              >
                Kab / Kota
              </label>
              <Select
                options={dataKota}
                value={selectedKota}
                onChange={handleKotaChange}
                className="w-64 sm:w-32 xl:w-60"
                theme={(theme) => ({
                  ...theme,
                  colors: {
                    ...theme.colors,
                    primary25: "lightgrey",
                    primary: "grey",
                  },
                })}
                isDisabled={user.role === "3" || !selectedProvinsi}
                placeholder={
                  selectedProvinsi
                    ? "Pilih Kab / Kota"
                    : "Pilih Provinsi Dahulu"
                }
              />
            </div>
            {/* <div>
              <label
                className="block text-[#728294] text-base font-normal mb-2"
                htmlFor="kecamatan"
              >
                Kecamatan
              </label>
              <Select
                options={dataKecamatan}
                value={selectedKecamatan}
                onChange={handleKecamatanChange}
                className="w-64 sm:w-32 xl:w-60"
                theme={(theme) => ({
                  ...theme,
                  colors: {
                    ...theme.colors,
                    primary25: "lightgrey",
                    primary: "grey",
                  },
                })}
                isDisabled={user.role === "3" || !selectedKota}
                placeholder={
                  selectedKota ? "Pilih Kecamatan" : "Pilih Kab / Kota Dahulu"
                }
              />
            </div> */}
          </div>
          <button
            onClick={handleSearchClick}
            disabled={loading}
            className="mt-2 flex items-center font-semibold gap-2 cursor-pointer text-base text-white px-5 py-2 bg-primary rounded-md tracking-tight"
          >
            <FaSearch />
            <span className="lg:hidden xl:flex">
              {" "}
              {loading ? "Loading" : "Cari Data"}
            </span>
          </button>
        </div>
      </div>
      <ModalTTE
        show={showModal}
        onClose={() => setShowModal(false)}
        jsonData={jsonData}
        user={user}
      />
      <div className="rounded-md flex flex-col gap-4 overflow-hidden overflow-x-auto  border border-stroke bg-white py-4 md:py-8 px-4 md:px-6 shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="flex justify-between mb-4 items-center">
          <div className="relative">
            <button className="absolute left-2 top-1/2 -translate-y-1/2">
              <svg
                className="fill-body hover:fill-primary dark:fill-bodydark dark:hover:fill-primary"
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M9.16666 3.33332C5.945 3.33332 3.33332 5.945 3.33332 9.16666C3.33332 12.3883 5.945 15 9.16666 15C12.3883 15 15 12.3883 15 9.16666C15 5.945 12.3883 3.33332 9.16666 3.33332ZM1.66666 9.16666C1.66666 5.02452 5.02452 1.66666 9.16666 1.66666C13.3088 1.66666 16.6667 5.02452 16.6667 9.16666C16.6667 13.3088 13.3088 16.6667 9.16666 16.6667C5.02452 16.6667 1.66666 13.3088 1.66666 9.16666Z"
                  fill=""
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M13.2857 13.2857C13.6112 12.9603 14.1388 12.9603 14.4642 13.2857L18.0892 16.9107C18.4147 17.2362 18.4147 17.7638 18.0892 18.0892C17.7638 18.4147 17.2362 18.4147 16.9107 18.0892L13.2857 14.4642C12.9603 14.1388 12.9603 13.6112 13.2857 13.2857Z"
                  fill=""
                />
              </svg>
            </button>

            <input
              type="text"
              value={search}
              onChange={handleSearch}
              placeholder="Cari Data..."
              className="w-full bg-white pl-9 pr-4 text-black outline outline-1 outline-zinc-200 focus:outline-primary dark:text-white xl:w-125 py-2 rounded-md"
            />
          </div>
          <div className="div flex gap-2 flex-row font-semibold">
            <button
              title="Export Data Distribusi"
              className="flex items-center gap-2 cursor-pointer text-base text-white px-4 py-2 bg-primary rounded-md tracking-tight"
              onClick={handleExport}
            >
              <BiExport />
              <span className="hidden sm:block">Export</span>
            </button>
            {user.role === "1" ? (
              <button
                title="Tambah Data Dokumen"
                className="flex font-semibold items-center gap-2 cursor-pointer text-base text-white  bg-primary rounded-md tracking-tight"
                onClick={handleExport}
              >
                <Link
                  to="/dokumen/add"
                  className="flex items-center gap-2 px-4 py-2"
                >
                  <FaPlus size={16} />
                  <span className="hidden sm:block">Tambah Data Dokumen</span>
                </Link>
              </button>
            ) : (
              ""
            )}
          </div>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center items-center">
              <CgSpinner className="animate-spin inline-block w-8 h-8 text-teal-400" />
              <span className="ml-2">Loading...</span>
            </div>
          ) : error || filteredData.length === 0 ? (
            <div className="text-center">Data Tidak Tersedia.</div>
          ) : (
            <DataTable
              columns={columns}
              data={filteredData}
              pagination
              persistTableHead
              highlightOnHover
              pointerOnHover
              customStyles={{
                headCells: {
                  style: {
                    backgroundColor: "#EBFBFA",
                    color: "#728294",
                  },
                },
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Dokumen;
