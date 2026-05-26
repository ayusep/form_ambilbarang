import { useEffect, useState, useCallback } from 'react';


const DataRequest = ({ user, filter }) => {

  const [requests, setRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 5;

  const [coaOptions, setCoaOptions] = useState([]);
  const [printData, setPrintData] = useState(null);

  const [selectedRow, setSelectedRow] = useState(null);

  const [isLoadingBarangEdit, setIsLoadingBarangEdit] = useState(false);

  // =========================
  // EDIT MODAL
  // =========================

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [searchBarangEdit, setSearchBarangEdit] = useState("");
  const [resultsBarangEdit, setResultsBarangEdit] = useState([]);
  const [selectedBarangEdit, setSelectedBarangEdit] = useState(null);

  const [searchMesinEdit, setSearchMesinEdit] = useState("");
  const [resultsMesinEdit, setResultsMesinEdit] = useState([]);
  const [selectedMesinEdit, setSelectedMesinEdit] = useState(null);

  const [qtyEdit, setQtyEdit] = useState(1);

  const [operatorEdit, setOperatorEdit] = useState("");

  const [coaEdit, setCoaEdit] = useState("");

  // =========================
  // OPTIONS
  // =========================

  const [options, setOptions] = useState({
    mesin: [],
    coa: [],
    teknisi: []
  });

  const [listBarangDariDB, setListBarangDariDB] = useState([]);

  // =========================
  // LOAD OPTIONS
  // =========================

  const loadOptions = async () => {

    try {

      const [
        resMesin,
        resCoa,
        resTeknisi
      ] = await Promise.all([

        fetch(
          'http://localhost:5000/api/permintaan/mesin'
        ).then(res => res.json()),

        fetch(
          `http://localhost:5000/api/permintaan/coa`
        ).then(res => res.json()),

        fetch(
          'http://localhost:5000/api/permintaan/teknisi'
        ).then(res => res.json())

      ]);

      setOptions({
        mesin: resMesin,
        coa: resCoa,
        teknisi: resTeknisi
      });

    } catch (err) {

      console.error(
        "Gagal load opsi:",
        err
      );

    }
  };

  useEffect(() => {

    if (
      searchBarangEdit.trim().length <= 0
    ) {

      setResultsBarangEdit([]);

      return;
    }

    const fetchBarang = async () => {

      setIsLoadingBarangEdit(true);

      try {

        const response = await fetch(
          `http://localhost:5000/api/barang/search?q=${searchBarangEdit}`
        );

        const data = await response.json();

        setResultsBarangEdit(data);

      } catch (err) {

        console.error(err);

        setResultsBarangEdit([]);

      } finally {

        setIsLoadingBarangEdit(false);

      }

    };

    const delay =
      setTimeout(fetchBarang, 400);

    return () => clearTimeout(delay);

  }, [searchBarangEdit]);

  useEffect(() => {

    if (
      searchMesinEdit.length > 0 &&
      !selectedMesinEdit
    ) {

      const filtered =
        options.mesin.filter((m) =>
          m.nama_mesin
            ?.toLowerCase()
            .includes(
              searchMesinEdit.toLowerCase()
            )
        );

      setResultsMesinEdit(filtered);

    } else {

      setResultsMesinEdit([]);

    }

  }, [
    searchMesinEdit,
    selectedMesinEdit,
    options.mesin
  ]);




  useEffect(() => {
    loadOptions();
  }, []);

  // =========================
  // FETCH DATA
  // =========================

  const fetchData = useCallback(async () => {
    try {

      const isAdminOrLogistik =
        ['admin', 'logistik'].includes(user?.role);

      const queryDepartemen =
        isAdminOrLogistik
          ? ''
          : user.id_departemen;

      const response = await fetch(
        `http://localhost:5000/api/permintaan/filter?bulan=${filter.bulan}&tahun=${filter.tahun}&departemen=${queryDepartemen}`
      );

      const data = await response.json();

      setRequests(data);

    } catch (err) {
      console.error("Gagal ambil data:", err);
    }
  }, [filter, user]);

  useEffect(() => {
    fetchData();
    setCurrentPage(1);
  }, [fetchData]);

  // =========================
  // FETCH COA
  // =========================

  useEffect(() => {

    const fetchCoaOptions = async () => {

      try {

        const response = await fetch(
          `http://localhost:5000/api/permintaan/coa`
        );

        const data = await response.json();

        setCoaOptions(data);

      } catch (err) {
        console.error("Gagal ambil daftar COA:", err);
      }
    };

    fetchCoaOptions();

  }, []);

  // =========================
  // OPEN EDIT
  // =========================

  const handleOpenEdit = (item) => {

    setSelectedRow(item);

    if (
      !['admin', 'logistik']
        .includes(user?.role)
    ) {
      return;
    }

    // ======================
    // BARANG
    // ======================

    const barangSelected = {
      id_barang: item.id_barang,
      nama_barang: item.nama_barang,
      kode_sap: item.kode_sap,
      harga_sap: item.harga_sap
    };

    setSelectedBarangEdit(barangSelected);

    setSearchBarangEdit(
      `${item.kode_sap} - ${item.nama_barang}`
    );

    // ======================
    // MESIN
    // ======================

    if (item.id_mesin) {

      const mesinSelected = {
        id_mesin: item.id_mesin,
        nama_mesin: item.nama_mesin
      };

      setSelectedMesinEdit(mesinSelected);

      setSearchMesinEdit(
        item.nama_mesin
      );

    } else {

      setSelectedMesinEdit(null);

      setSearchMesinEdit("");

    }

    // ======================
    // QTY
    // ======================

    setQtyEdit(item.qty);

    // ======================
    // TEKNISI
    // ======================

    setOperatorEdit(
      item.operator_maintenance || ""
    );

    // ======================
    // COA
    // ======================

    setCoaEdit(
      item.id_coa || ""
    );

    setIsEditModalOpen(true);
  };

  // =========================
  // UPDATE REQUEST
  // =========================

  const handleUpdate = async (e) => {

    e.preventDefault();

    if (!selectedBarangEdit) {
      return alert("Pilih barang!");
    }

    try {

      const response = await fetch(
        `http://localhost:5000/api/permintaan/detail/${selectedRow.id_permintaan}`,
        {

          method: 'PUT',

          headers: {
            'Content-Type': 'application/json'
          },

          body: JSON.stringify({

            id_barang:
              selectedBarangEdit.id_barang,

            role: user.role,

            qty: qtyEdit,

            id_mesin:
              selectedMesinEdit
                ? selectedMesinEdit.id_mesin
                : null,

            operator_maintenance:
              operatorEdit,

            id_coa:
              coaEdit

          })

        }
      );

      const result =
        await response.json();

      if (response.ok) {

        alert("Berhasil update");

        setIsEditModalOpen(false);

        setSelectedRow(null);

        fetchData();

      } else {

        alert(result.error);

      }

    } catch (err) {

      console.error(err);

      alert("Terjadi kesalahan");

    }
  };

  // =========================
  // EDIT COA INLINE
  // =========================

  const [editingCoa, setEditingCoa] =
    useState(null);

  const [tempCoa, setTempCoa] =
    useState("");

  const handleUpdateCoa = async (
    id_permintaan
  ) => {

    if (!tempCoa) {
      alert("Pilih COA terlebih dahulu");
      return;
    }

    try {

      const response = await fetch(
        `http://localhost:5000/api/permintaan/detail/${id_permintaan}`,
        {
          method: 'PUT',

          headers: {
            'Content-Type': 'application/json'
          },

          body: JSON.stringify({
            id_coa: tempCoa,
            role: user.role
          })
        }
      );

      if (response.ok) {

        setEditingCoa(null);

        setTempCoa("");

        fetchData();

      } else {

        const errorData =
          await response.json();

        alert(
          "Gagal: " + errorData.error
        );
      }

    } catch (err) {

      console.error(
        "Error update COA:",
        err
      );

    }
  };

  // =========================
  // APPROVE / REJECT
  // =========================

  const handleActionItem = async (
    id_permintaan,
    nama_barang,
    statusBaru
  ) => {

    let alasan = null;

    if (statusBaru === 'Rejected') {

      alasan = prompt(
        `Masukkan alasan reject untuk barang: ${nama_barang}`
      );

      if (alasan === null) return;

    }

    try {

      const response = await fetch(
        `http://localhost:5000/api/permintaan/status/${id_permintaan}`,
        {

          method: 'PUT',

          headers: {
            'Content-Type': 'application/json'
          },

          body: JSON.stringify({

            status_approval: statusBaru,

            keterangan: alasan

          })

        }
      );

      const result = await response.json();

      if (response.ok) {

        alert(result.message);

        fetchData();

      } else {

        alert(result.error);

      }

    } catch (err) {

      console.error(err);

      alert('Gagal update status');

    }

  };

  // =========================
  // PRINT
  // =========================

  const handlePrintManual = (fab) => {

    setPrintData(fab);

    setTimeout(() => {
      window.print();
    }, 500);
  };

  // =========================
  // GROUP DATA
  // =========================

  const groupedData = requests.reduce(
    (acc, item) => {

      const key = item.no_fab;

      if (!acc[key]) {

        acc[key] = {
          ...item,
          allItems: [],
          totalHargaFAB: 0
        };
      }

      acc[key].allItems.push(item);

      acc[key].totalHargaFAB += (
        Number(item.qty) *
        Number(item.harga_sap || 0)
      );

      return acc;

    }, {}
  );

  const finalData =
    Object.values(groupedData)
      .sort((a, b) => b.no_fab - a.no_fab);

  // =========================
  // TOTAL BUDGET
  // =========================

  const totalBudgetTerpakai =
    requests.reduce((sum, item) => {

      if (
        ['Pending', 'Approved', 'Closed']
          .includes(item.status_approval)
      ) {

        return sum + (
          Number(item.qty) *
          Number(item.harga_sap || 0)
        );

      }

      return sum;

    }, 0);

  // =========================
  // UNIQUE COA
  // =========================

  const uniqueCoaOptions = Array.from(
    new Map(
      coaOptions.map(item => [
        `${item.kode_akun}-${item.coa}`,
        item
      ])
    ).values()
  ).sort((a, b) =>
    a.kode_akun.localeCompare(b.kode_akun)
  );


  const uniqueCoaModalOptions = Array.from(
    new Map(
      options.coa.map(item => [
        `${item.kode_akun}-${item.coa}`,
        item
      ])
    ).values()
  ).sort((a, b) =>
    a.kode_akun.localeCompare(b.kode_akun)
  );
  // =========================
  // FILTER DATA
  // =========================

  const filteredData = finalData.filter(
    fab => {

      if (user?.role === 'logistik') {

        if (
          !['Approved', 'Closed']
            .includes(fab.status_approval)
        ) {
          return false;
        }
      }

      const matchesStatus =
        statusFilter === 'All' ||
        fab.status_approval === statusFilter;

      const search =
        searchTerm.toLowerCase();

      const matchesItems =
        fab.allItems.some(item =>
          item.nama_barang
            ?.toLowerCase()
            .includes(search) ||

          item.nama_mesin
            ?.toLowerCase()
            .includes(search) ||

          item.operator_maintenance
            ?.toLowerCase()
            .includes(search)
        );

      const tglFormatted =
        new Date(fab.tgl_permintaan)
          .toLocaleDateString('id-ID');

      const matchesHeader =

        fab.no_fab.toString()
          .includes(search)

        ||

        fab.nama
          ?.toLowerCase()
          .includes(search)

        ||

        fab.nama_departemen
          ?.toLowerCase()
          .includes(search)

        ||

        tglFormatted.includes(search);

      return (
        matchesStatus &&
        (matchesHeader || matchesItems)
      );
    }
  );

  const indexOfLastItem =
    currentPage * itemsPerPage;

  const indexOfFirstItem =
    indexOfLastItem - itemsPerPage;

  const currentItems =
    filteredData.slice(
      indexOfFirstItem,
      indexOfLastItem
    );

  const totalPages =
    Math.ceil(
      filteredData.length / itemsPerPage
    );

  // =========================
  // FORMAT
  // =========================

  const formatIDR = (num) =>
    new Intl.NumberFormat(
      'id-ID',
      {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0
      }
    ).format(num);

  const getBadgeColor = (status) => {

    switch (status) {

      case 'Pending':
        return '#f1c40f';

      case 'Approved':
        return '#3498db';

      case 'Closed':
        return '#27ae60';

      case 'Rejected':
        return '#e74c3c';

      default:
        return '#95a5a6';
    }
  };

  return (
    <div style={{
      padding: '20px',
      fontFamily: 'Inter, sans-serif'
    }}>

      <style>
        {`
@media screen{
  .print-wrapper{
    display:none;
  }
}

@media print{

  body *{
    visibility:hidden;
  }

  .print-wrapper,
  .print-wrapper *{
    visibility:visible;
  }

  .print-wrapper{
    position:fixed;
    top:0;
    left:0;
  }

  .print-area{
    width:210mm;
    min-height:29.5mm;
    padding:2mm;
    margin:0;
    box-sizing:border-box;
    font-family:Arial;
  }

  table{
    width:100%;
    border-collapse:collapse;
  }

  th,td{
    border:1px solid black;
    font-size:8.5px;
    padding:2px 4px;
  }

  th{
    background:#efefef;
  }

  @page{
    size:210mm 29.5mm;
    margin:0;
  }

}
`}
      </style>

      <header style={s.header}>

        <div>

          <h2 style={{
            color: '#2c3e50',
            margin: 0
          }}>
            📋 Data Request {filter.bulan}/{filter.tahun}
          </h2>

          <small style={{
            color: '#7f8c8d'
          }}>
            Role:
            <span style={{
              fontWeight: 'bold',
              color: '#2980b9'
            }}>
              {' '}
              {user?.role?.toUpperCase()}
            </span>
          </small>

        </div>

        <div style={{
          display: 'flex',
          gap: '10px'
        }}>

          <select
            style={s.selectFilter}
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
          >

            <option value="All">
              Semua Status
            </option>

            {user?.role !== 'logistik' && (
              <option value="Pending">
                Pending
              </option>
            )}

            <option value="Approved">
              Approved
            </option>

            {user?.role !== 'logistik' && (
              <option value="Rejected">
                Rejected
              </option>
            )}

            <option value="Closed">
              Closed
            </option>

          </select>

          <input
            type="text"
            placeholder="Cari FAB, Nama, Barang, Mesin..."
            style={s.searchInput}
            value={searchTerm}
            onChange={(e) => {

              setSearchTerm(e.target.value);

              setCurrentPage(1);

            }}
          />

        </div>

      </header>

      <div style={s.tableCard}>

        <table style={s.table}>

          <thead>

            <tr style={s.trHead}>

              <th style={s.th}>NO. FAB</th>
              <th style={s.th}>TANGGAL</th>
              <th style={s.th}>PEMOHON</th>
              <th style={s.th}>LIST BARANG</th>
              <th style={s.th}>DETAIL PENGGUNAAN</th>
              <th style={s.th}>HARGA</th>
              <th style={s.th}>TOTAL</th>
              <th style={s.th}>STATUS</th>
              <th style={s.th}>KETERANGAN</th>

              {user?.role !== 'operasional' && (
                <th style={s.th}>AKSI</th>
              )}

            </tr>

          </thead>

          <tbody>

            {currentItems.length === 0 ? (

              <tr>
                <td
                  colSpan="10"
                  style={{
                    textAlign: 'center',
                    padding: '30px'
                  }}
                >
                  Data tidak ditemukan.
                </td>
              </tr>

            ) : currentItems.map((fab) => (

              fab.allItems.map((item, index) => {

                const canEdit =
                  ['admin', 'logistik']
                    .includes(user?.role);

                return (

                  <tr
                    key={`${fab.no_fab}-${index}`}
                    style={s.trBody}
                  >

                    {/* NO FAB */}

                    {index === 0 && (
                      <td
                        rowSpan={fab.allItems.length}
                        style={{
                          ...s.td,
                          fontWeight: 'bold',
                          verticalAlign: 'top'
                        }}
                      >
                        #{fab.no_fab}
                      </td>
                    )}

                    {/* TANGGAL */}

                    {index === 0 && (
                      <td
                        rowSpan={fab.allItems.length}
                        style={{
                          ...s.td,
                          verticalAlign: 'top'
                        }}
                      >
                        {new Date(
                          fab.tgl_permintaan
                        ).toLocaleDateString('id-ID')}
                      </td>
                    )}

                    {/* PEMOHON */}

                    {index === 0 && (
                      <td
                        rowSpan={fab.allItems.length}
                        style={{
                          ...s.td,
                          verticalAlign: 'top'
                        }}
                      >

                        <strong>
                          {fab.nama}
                        </strong>

                        <br />

                        <small style={{
                          color: '#7f8c8d'
                        }}>
                          {fab.nama_departemen}
                        </small>

                      </td>
                    )}

                    {/* LIST BARANG */}

                    <td
                      style={{
                        ...s.td,
                        cursor: canEdit
                          ? 'pointer'
                          : 'default'
                      }}

                      onClick={() => {

                        if (canEdit) {
                          handleOpenEdit(item);
                        }

                      }}
                    >

                      <div style={{
                        fontWeight: 'bold'
                      }}>
                        {item.nama_barang}
                      </div>

                      <small style={{
                        color: '#7f8c8d'
                      }}>
                        Qty: {item.qty}
                      </small>

                    </td>

                    {/* DETAIL PENGGUNAAN */}

                    <td style={s.td}>

                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px',
                        fontSize: '11px'
                      }}>

                        <div>
                          ⚙️ {item.nama_mesin || '-'}
                        </div>

                        <div>
                          👷 {item.operator_maintenance || '-'}
                        </div>

                        <div>

                          🏷️

                          {editingCoa === item.id_permintaan ? (

                            <div style={{
                              display: 'flex',
                              gap: '4px',
                              marginTop: '4px',
                              alignItems: 'center',
                              flexWrap: 'wrap'
                            }}>

                              <select
                                value={tempCoa}
                                onChange={(e) =>
                                  setTempCoa(
                                    e.target.value
                                  )
                                }
                                style={{
                                  fontSize: '10px',
                                  padding: '4px',
                                  borderRadius: '4px'
                                }}
                              >

                                <option value="">
                                  -- Pilih COA --
                                </option>

                                {uniqueCoaOptions.map(option => (

                                  <option
                                    key={option.id_coa}
                                    value={option.id_coa}
                                  >
                                    {option.kode_akun}
                                    {' - '}
                                    {option.coa}
                                  </option>

                                ))}

                              </select>

                              <button
                                onClick={() =>
                                  handleUpdateCoa(
                                    item.id_permintaan
                                  )
                                }
                                style={{
                                  padding: '4px 8px',
                                  cursor: 'pointer',
                                  background: '#27ae60',
                                  color: '#fff',
                                  border: 'none',
                                  borderRadius: '4px',
                                  fontSize: '10px'
                                }}
                              >
                                Simpan
                              </button>

                              <button
                                onClick={() => {

                                  setEditingCoa(null);

                                  setTempCoa("");

                                }}
                                style={{
                                  padding: '4px 8px',
                                  cursor: 'pointer',
                                  background: '#e74c3c',
                                  color: '#fff',
                                  border: 'none',
                                  borderRadius: '4px',
                                  fontSize: '10px'
                                }}
                              >
                                Batal
                              </button>

                            </div>

                          ) : (

                            <span
                              style={{

                                cursor:
                                  ['admin', 'logistik']
                                    .includes(user?.role)
                                    ? 'pointer'
                                    : 'default',

                                textDecoration:
                                  ['admin', 'logistik']
                                    .includes(user?.role)
                                    ? 'underline dotted'
                                    : 'none',

                                color:
                                  ['admin', 'logistik']
                                    .includes(user?.role)
                                    ? '#2980b9'
                                    : 'inherit',

                                fontWeight: 'bold'
                              }}

                              onClick={() => {

                                if (
                                  ['admin', 'logistik']
                                    .includes(user?.role)
                                ) {

                                  setEditingCoa(
                                    item.id_permintaan
                                  );

                                  setTempCoa(
                                    item.id_coa || ""
                                  );
                                }
                              }}
                            >

                              {' '}
                              {item.nama_coa || 'Pilih COA'}

                            </span>

                          )}

                        </div>

                      </div>

                    </td>

                    {/* HARGA SATUAN */}

                    <td style={{
                      ...s.td,
                      color: '#2980b9',
                      fontWeight: 'bold'
                    }}>
                      {formatIDR(item.harga_sap || 0)}
                    </td>

                    {/* TOTAL */}

                    <td style={{
                      ...s.td,
                      color: '#27ae60',
                      fontWeight: 'bold'
                    }}>
                      {formatIDR(
                        Number(item.qty || 0) *
                        Number(item.harga_sap || 0)
                      )}
                    </td>

                    {/* STATUS */}

                    <td style={s.td}>

                      <span style={{
                        ...s.badge,
                        backgroundColor:
                          getBadgeColor(
                            item.status_approval
                          )
                      }}>
                        {item.status_approval}
                      </span>

                    </td>

                    {/* KETERANGAN */}

                    <td style={{
                      ...s.td,
                      fontSize: '11px',
                      color: '#e74c3c',
                      maxWidth: '180px'
                    }}>
                      {item.keterangan || '-'}
                    </td>

                    {/* AKSI */}

{user?.role !== 'operasional' && (
  <td style={s.td}>
    <div
      style={{
        display: 'flex',
        gap: '5px',
        flexWrap: 'wrap',
      }}
    >

      {/* APPROVER */}
      {['approver', 'admin'].includes(user?.role) &&
        item.status_approval === 'Pending' && (
          <>
            <button
              onClick={() =>
                handleActionItem(
                  item.id_permintaan,
                  item.nama_barang,
                  'Approved'
                )
              }
              style={s.btnA}
            >
              Approve
            </button>

            <button
              onClick={() =>
                handleActionItem(
                  item.id_permintaan,
                  item.nama_barang,
                  'Rejected'
                )
              }
              style={s.btnR}
            >
              Reject
            </button>
          </>
        )}

      {/* LOGISTIK */}
      {['logistik', 'admin'].includes(user?.role) &&
        item.status_approval === 'Approved' && (
          <>
            {/* Reject setelah manager approve */}
            <button
              onClick={() =>
                handleActionItem(
                  item.id_permintaan,
                  item.nama_barang,
                  'Rejected'
                )
              }
              style={s.btnR}
            >
              Reject
            </button>

            {/* Close order */}
            <button
              onClick={() =>
                handleActionItem(
                  item.id_permintaan,
                  item.nama_barang,
                  'Closed'
                )
              }
              style={s.btnC}
            >
              Close Order
            </button>
          </>
        )}

      {/* PRINT */}
       {['logistik', 'admin'].includes(user?.role) && fab.status_approval === 'Closed' && (
                        <button onClick={() => handlePrintManual(fab)} style={{ ...s.btnA, backgroundColor: '#8e44ad' }}>🖨️ Print</button>
                      )}

    </div>
  </td>
)}

                  </tr>

                );

              })

            ))}

          </tbody>

        </table>

      </div>

      {/* FOOTER */}

      <div style={s.footer}>

        <div style={s.pagination}>

          <button
            disabled={currentPage === 1}
            onClick={() =>
              setCurrentPage(prev => prev - 1)
            }
            style={
              currentPage === 1
                ? s.pageBtnDisabled
                : s.pageBtn
            }
          >
            Prev
          </button>

          {[...Array(totalPages)].map((_, i) => (

            <button
              key={i + 1}
              onClick={() =>
                setCurrentPage(i + 1)
              }
              style={
                currentPage === i + 1
                  ? s.pageBtnActive
                  : s.pageBtn
              }
            >
              {i + 1}
            </button>

          ))}

          <button
            disabled={
              currentPage === totalPages ||
              totalPages === 0
            }
            onClick={() =>
              setCurrentPage(prev => prev + 1)
            }
            style={
              currentPage === totalPages ||
                totalPages === 0
                ? s.pageBtnDisabled
                : s.pageBtn
            }
          >
            Next
          </button>

        </div>

        {/* TOTAL */}

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '15px'
        }}>


          <div style={s.grandTotalBox}>

            <div style={{
              color: '#7f8c8d',
              fontSize: '12px',
              fontWeight: 'bold'
            }}>
              Total Budget Terpakai
            </div>

            <div style={{
              color: '#27ae60',
              fontSize: '20px',
              fontWeight: 'bold'
            }}>
              {formatIDR(totalBudgetTerpakai)}
            </div>

          </div>

        </div>

      </div>

      {/* =======================================
PRINT AREA
======================================= */}

      {printData && (

        <div className="print-wrapper">

          <div className="print-area">

            <table
              style={{
                width: '100%',
                tableLayout: 'fixed',
                borderCollapse: 'collapse'
              }}
            >

              <tbody>

                <tr>

                  <td
                    style={{
                      width: '45px',
                      textAlign: 'center',
                      border: '1px solid black'
                    }}
                  >

                    <img
                      src={`${window.location.origin}/BBP LOGO.png`}
                      style={{ width: '30px' }}
                      alt="Logo"
                    />

                  </td>

                  <td
                    style={{
                      width: '250px',
                      border: '1px solid black',
                      padding: '5px'
                    }}
                  >

                    <div style={{
                      fontWeight: 'bold',
                      fontSize: '10px'
                    }}>
                      PT. BAHANA BHUMIPHALA PERSADA
                    </div>

                    <div style={{
                      fontSize: '7px'
                    }}>
                      Jl. Raya Semarang - Pekalongan Km. 59 Batang
                    </div>

                  </td>

                  {[
                    {
                      label: 'User',
                      jabatan: 'Staff'
                    },
                    {
                      label: 'Mengetahui',
                      jabatan: 'Spv/Kabag/Mgr'
                    },
                    {
                      label: 'GNBB',
                      jabatan: 'Staff Logistik'
                    }
                  ].map((item) => (

                    <td
                      key={item.label}
                      rowSpan="2"
                      style={{
                        textAlign: 'center',
                        verticalAlign: 'top',
                        width: '100px',
                        border: '1px solid black',
                        padding: '4px'
                      }}
                    >

                      <div style={{
                        fontSize: '8px',
                        fontWeight: 'bold'
                      }}>
                        {item.label}
                      </div>

                      <div style={{
                        marginTop: '8px',
                        fontSize: '7px',
                        color: '#27ae60',
                        border: '1px solid #27ae60',
                        display: 'inline-block',
                        padding: '1px 4px',
                        fontWeight: 'bold',
                        transform: 'rotate(-5deg)',
                        borderRadius: '2px'
                      }}>
                        APPROVED
                      </div>

                      <div style={{
                        fontSize: '7px',
                        marginTop: '8px',
                        fontWeight: '500'
                      }}>
                        {item.jabatan}
                      </div>

                    </td>

                  ))}

                </tr>

                <tr>

                  <td
                    colSpan="2"
                    style={{
                      background: 'black',
                      color: 'white',
                      textAlign: 'center',
                      fontWeight: 'bold',
                      fontSize: '13px',
                      padding: '5px',
                      border: '1px solid black'
                    }}
                  >
                    FORM AMBIL BARANG (FAB)
                  </td>

                </tr>

              </tbody>

            </table>

            {/* INFO */}

            <table>

              <tbody>

                <tr>

                  <td style={{ width: '30%' }}>
                    Bagian :
                    <b> {printData.nama_departemen}</b>
                  </td>

                  <td style={{ width: '20%' }}>
                    Sub :
                    <b> {printData.nama_divisi}</b>
                  </td>

                  <td style={{ width: '25%' }}>
                    Tanggal :
                    <b>
                      {' '}
                      {new Date(
                        printData.tgl_permintaan
                      ).toLocaleDateString('id-ID')}
                    </b>
                  </td>

                  <td style={{ width: '25%' }}>
                    No FAB :
                    <b> {printData.no_fab}</b>
                  </td>

                </tr>

              </tbody>

            </table>

            {/* TABLE BARANG */}

            <table>

              <thead>

                <tr>

                  <th rowSpan="2">No</th>
                  <th rowSpan="2">Nama Barang</th>
                  <th rowSpan="2">Spesifikasi</th>
                  <th rowSpan="2">Kode Barang</th>

                  <th colSpan="2">
                    Kuantitas
                  </th>

                  <th colSpan="3">
                    Penggunaan
                  </th>

                  <th rowSpan="2">
                    Keterangan
                  </th>

                </tr>

                <tr>

                  <th>Jml</th>
                  <th>Sat</th>
                  <th>COA</th>
                  <th>Mesin</th>
                  <th>Teknisi</th>

                </tr>

              </thead>

              <tbody>

                {Array.from({ length: 10 })
                  .map((_, i) => {

                    const item =
                      printData.allItems[i];

                    return (

                      <tr
                        key={i}
                        style={{ height: '20px' }}
                      >

                        <td style={{
                          textAlign: 'center'
                        }}>
                          {i + 1}
                        </td>

                        <td>
                          {item?.nama_barang || ''}
                        </td>

                        <td>
                          {item?.spesifikasi || '-'}
                        </td>

                        <td style={{
                          textAlign: 'center'
                        }}>
                          {item?.kode_sap || ''}
                        </td>

                        <td style={{
                          textAlign: 'center'
                        }}>
                          {item?.qty || ''}
                        </td>

                        <td style={{
                          textAlign: 'center'
                        }}>
                          {item?.satuan || ''}
                        </td>

                        <td style={{
                          textAlign: 'center'
                        }}>
                          {item?.nama_coa || ''}
                        </td>

                        <td style={{
                          textAlign: 'center'
                        }}>
                          {item?.nama_mesin || ''}
                        </td>

                        <td style={{
                          textAlign: 'center'
                        }}>
                          {item?.operator_maintenance || ''}
                        </td>

                        <td style={{
                          fontSize: '7px'
                        }}>
                          {i === 0
                            ? printData.keterangan
                            : ''}
                        </td>

                      </tr>

                    );

                  })}

              </tbody>

            </table>

            {/* FOOTER PRINT */}

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '7px',
                marginTop: '2px'
              }}
            >

              <div>
                *) Form digandakan :
                Lembar Putih : Accounting,
                Biru : GNBB,
                Kuning : User
              </div>

              <div>
                Printed :
                {' '}
                {new Date().toLocaleString('id-ID')}
              </div>

            </div>

          </div>
        </div>

      )}

      {/* =======================================
          MODAL EDIT
          ======================================= */}

      {/* {isEditModalOpen && selectedRow && (

        <div style={modalStyle.overlay}>

          <div style={modalStyle.modal}>

            <h3 style={{
              marginTop: 0,
              color: '#2c3e50'
            }}>
              ✏️ Edit Request
            </h3>

            <form onSubmit={handleUpdate}>

              {/* =========================
BARANG
========================= */}

              {/* <div style={modalStyle.formGroup}>

                <label>
                  Cari Barang
                </label>

                <div style={{
                  position: 'relative'
                }}>

                  <input
                    type="text"
                    value={searchBarangEdit}
                    onChange={(e) => {

                      setSearchBarangEdit(
                        e.target.value
                      );

                      setSelectedBarangEdit(null);

                    }}
                    placeholder="Cari barang..."
                    style={modalStyle.input}
                  />

                  {isLoadingBarangEdit && (

                    <div style={modalStyle.dropdown}>

                      <div style={modalStyle.dropdownItem}>
                        🔍 Mencari barang...
                      </div>

                    </div>

                  )}

                  {!isLoadingBarangEdit &&
                    searchBarangEdit.length > 1 &&
                    resultsBarangEdit.length === 0 &&
                    !selectedBarangEdit && (

                      <div style={modalStyle.dropdown}>

                        <div style={modalStyle.dropdownItem}>
                          Barang tidak ditemukan
                        </div>

                      </div>

                    )}

                  {resultsBarangEdit.length > 0 && (

                    <div style={modalStyle.dropdown}>

                      {resultsBarangEdit.map((b) => (

                        <div
                          key={b.id_barang}
                          style={modalStyle.dropdownItem}
                          onClick={() => {

                            setSelectedBarangEdit(b);

                            setSearchBarangEdit(
                              `${b.kode_sap} - ${b.nama_barang}`
                            );

                            setResultsBarangEdit([]);

                          }}
                        >

                          <div style={{
                            fontSize: '11px',
                            color: '#7f8c8d'
                          }}>
                            {b.kode_sap}
                          </div>

                          <div>
                            {b.nama_barang}
                          </div>

                        </div>

                      ))}

                    </div>

                  )}

                </div>

              </div>

              {/* =========================
QTY
========================= */}

              {/* <div style={modalStyle.formGroup}>

                <label>
                  Qty
                </label>

                <input
                  type="number"
                  step="any"
                  min="0.01"
                  value={qtyEdit}
                  onChange={(e) =>
                    setQtyEdit(e.target.value)
                  }
                  style={modalStyle.input}
                />

              </div> */}

              {/* =========================
MESIN
========================= */}

              {/* <div style={modalStyle.formGroup}>

                <label>
                  Mesin
                </label>

                <div style={{
                  position: 'relative'
                }}>

                  <input
                    type="text"
                    value={searchMesinEdit}
                    onChange={(e) => {

                      setSearchMesinEdit(
                        e.target.value
                      );

                      setSelectedMesinEdit(null);

                    }}
                    placeholder="Cari mesin..."
                    style={modalStyle.input}
                  />

                  {resultsMesinEdit.length > 0 && (

                    <div style={modalStyle.dropdown}>

                      {resultsMesinEdit.map((m) => (

                        <div
                          key={m.id_mesin}
                          style={modalStyle.dropdownItem}
                          onClick={() => {

                            setSelectedMesinEdit(m);

                            setSearchMesinEdit(
                              m.nama_mesin
                            );

                            setResultsMesinEdit([]);

                          }}
                        >

                          <div style={{
                            fontSize: '11px',
                            color: '#7f8c8d'
                          }}>
                            {m.no_item}
                          </div>

                          <div>
                            {m.nama_mesin}
                          </div>

                        </div>

                      ))}

                    </div>

                  )}

                </div>

              </div> */}

              {/* =========================
TEKNISI
========================= */}

              {/* <div style={modalStyle.formGroup}>

                <label>
                  Teknisi
                </label>

                <select
                  value={operatorEdit}
                  onChange={(e) =>
                    setOperatorEdit(
                      e.target.value
                    )
                  }
                  style={modalStyle.input}
                >

                  <option value="">
                    -- Pilih Teknisi --
                  </option>

                  {options.teknisi.map((t) => (

                    <option
                      key={t.id_user}
                      value={t.nama}
                    >
                      {t.nama}
                    </option>

                  ))}

                </select>

              </div> */}

              {/* =========================
COA
========================= */}

              {/* <div style={modalStyle.formGroup}>

                <label>
                  COA
                </label>

                <select
                  value={coaEdit}
                  onChange={(e) =>
                    setCoaEdit(
                      e.target.value
                    )
                  }
                  style={modalStyle.input}
                >

                  <option value="">
                    -- Pilih COA --
                  </option>

                  {uniqueCoaModalOptions.map((c) => (

                    <option
                      key={c.id_coa}
                      value={c.id_coa}
                    >

                      {c.kode_akun}
                      {' - '}
                      {c.coa}

                    </option>

                  ))}

                </select>

              </div> */}

              {/* =========================
BUTTON
========================= */}

              {/* <div style={{
                display: 'flex',
                gap: '10px',
                marginTop: '20px'
              }}>

                <button
                  type="submit"
                  style={s.btnA}
                >
                  💾 Simpan
                </button>

                <button
                  type="button"
                  style={s.btnR}
                  onClick={() => {

                    setIsEditModalOpen(false);

                    setSelectedRow(null);

                  }}
                >
                  Batal
                </button>

              </div>

            </form>

          </div>

        </div>

      )} */} 

    </div>
  );
};

const modalStyle = {

  dropdown: {

    position: 'absolute',

    top: '100%',

    left: 0,

    right: 0,

    background: '#fff',

    border: '1px solid #ddd',

    borderRadius: '6px',

    marginTop: '3px',

    zIndex: 9999,

    maxHeight: '220px',

    overflowY: 'auto',

    boxShadow:
      '0 4px 10px rgba(0,0,0,0.1)'

  },

  dropdownItem: {

    padding: '10px',

    cursor: 'pointer',

    borderBottom:
      '1px solid #f1f1f1',

    fontSize: '13px'

  },

  overlay: {

    position: 'fixed',

    top: 0,
    left: 0,
    right: 0,
    bottom: 0,

    background:
      'rgba(0,0,0,0.5)',

    display: 'flex',

    justifyContent: 'center',

    alignItems: 'center',

    zIndex: 999

  },

  modal: {

    background: '#fff',

    padding: '25px',

    borderRadius: '10px',

    width: '420px',

    maxHeight: '90vh',

    overflowY: 'auto',

    boxShadow:
      '0 4px 20px rgba(0,0,0,0.2)'

  },

  formGroup: {

    display: 'flex',

    flexDirection: 'column',

    gap: '5px',

    marginBottom: '15px'

  },

  input: {

    padding: '10px',

    borderRadius: '6px',

    border: '1px solid #ddd',

    fontSize: '13px'

  }

};

const s = {

  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px'
  },

  selectFilter: {
    padding: '8px',
    borderRadius: '6px',
    border: '1px solid #ddd',
    fontSize: '12px',
    backgroundColor: '#fff',
    cursor: 'pointer'
  },

  searchInput: {
    padding: '8px 12px',
    borderRadius: '6px',
    border: '1px solid #ddd',
    width: '250px',
    fontSize: '12px'
  },

  tableCard: {
    backgroundColor: 'white',
    borderRadius: '10px',
    boxShadow:
      '0 4px 12px rgba(0,0,0,0.08)',
    overflow: 'hidden'
  },

  table: {
    width: '100%',
    borderCollapse: 'collapse'
  },

  trHead: {
    backgroundColor: '#2c3e50',
    color: 'white'
  },

  th: {
    padding: '15px 12px',
    fontSize: '11px',
    textAlign: 'left',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },

  trBody: {
    borderBottom: '1px solid #eee',
    transition: '0.2s'
  },

  td: {
    padding: '12px',
    fontSize: '13px',
    verticalAlign: 'middle'
  },

  innerCell: {
    padding: '6px 12px',
    fontSize: '11px',
    borderBottom: '1px solid #f1f1f1',
    color: '#34495e'
  },

  badge: {
    padding: '4px 10px',
    borderRadius: '12px',
    color: 'white',
    fontSize: '10px',
    fontWeight: 'bold'
  },

  btnA: {
    padding: '6px 10px',
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '11px',
    fontWeight: 'bold'
  },

  btnR: {
    padding: '6px 10px',
    backgroundColor: '#e74c3c',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '11px',
    fontWeight: 'bold'
  },

  btnC: {
    padding: '6px 10px',
    backgroundColor: '#27ae60',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '11px',
    fontWeight: 'bold'
  },

  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '20px',
    padding: '15px',
    backgroundColor: '#f8f9fa',
    borderRadius: '10px'
  },

  pagination: {
    display: 'flex',
    gap: '5px'
  },

  pageBtn: {
    padding: '6px 12px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    cursor: 'pointer',
    backgroundColor: '#fff',
    fontSize: '12px'
  },

  pageBtnActive: {
    padding: '6px 12px',
    borderRadius: '4px',
    border: '1px solid #2c3e50',
    backgroundColor: '#2c3e50',
    color: '#fff',
    fontSize: '12px',
    fontWeight: 'bold'
  },

  pageBtnDisabled: {
    padding: '6px 12px',
    borderRadius: '4px',
    border: '1px solid #eee',
    backgroundColor: '#f9f9f9',
    color: '#ccc',
    cursor: 'not-allowed',
    fontSize: '12px'
  },

  grandTotalBox: {
    textAlign: 'right',
    borderLeft: '3px solid #27ae60',
    paddingLeft: '15px'
  }

};

export default DataRequest;