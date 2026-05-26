const express = require('express');
const router = express.Router();
const pool = require('../db');
const ExcelJS = require('exceljs');

router.get('/excel', async (req, res) => {

  const {
    tanggal_awal,
    tanggal_akhir
  } = req.query;

  try {

    const result = await pool.query(
      `
      SELECT
        p.no_fab,
        p.tgl_permintaan,
        b.kode_sap,
        b.nama_barang,
        p.qty,
        u.nama,
        c.kode_akun AS coa,
        d.nama_departemen,
        div.nama_divisi,
        b.harga_sap,
        (p.qty * b.harga_sap) as total,
        m.nama_mesin,
        p.operator_maintenance,
        p.status_approval
      FROM permintaan_barang p
      JOIN users u
        ON p.id_user = u.id_user
      JOIN departemen d
        ON u.id_departemen = d.id_departemen
      LEFT JOIN divisi div
        ON u.id_divisi = div.id_divisi
      JOIN barang b
        ON p.id_barang = b.id_barang
      LEFT JOIN coa c
        ON p.coa = c.id_coa
      LEFT JOIN mesin m
        ON p.mesin = m.id_mesin
      WHERE DATE(p.tgl_permintaan)
        BETWEEN $1 AND $2
      ORDER BY p.tgl_permintaan DESC
      `,
      [tanggal_awal, tanggal_akhir]
    );

    const workbook = new ExcelJS.Workbook();

    const worksheet =
      workbook.addWorksheet('Data FAB');

    worksheet.columns = [

      {
        header: 'FAB',
        key: 'no_fab',
        width: 15
      },

      {
        header: 'TGL',
        key: 'tgl_permintaan',
        width: 20
      },

      {
        header: 'Kode',
        key: 'kode_sap',
        width: 20
      },

      {
        header: 'ITEM',
        key: 'nama_barang',
        width: 30
      },

      {
        header: 'JML',
        key: 'qty',
        width: 10
      },

      {
        header: 'Uom Name',
        key: '',
        width: 1
      },

      {
        header: 'Whse',
        key: '',
        width: 1
      },

      {
        header: 'REMARK',
        key: 'nama',
        width: 25
      },

      {
        header: 'CODE',
        key: 'coa',
        width: 25
      },
      
      {
        header: 'Item Cost',
        key: 'harga_sap',
        width: 20
      },

      {
        header: 'DIST. RULE',
        key: 'nama_divisi',
        width: 25
      },

      {
        header: 'JOURNAL REMARK',
        key: 'nama_departemen',
        width: 25
      },

      {
        header: 'Total',
        key: 'total',
        width: 20
      },

      {
        header: 'Mesin',
        key: 'nama_mesin',
        width: 25
      },

      {
        header: 'Teknisi',
        key: 'operator_maintenance',
        width: 25
      },

      {
        header: 'Status',
        key: 'status_approval',
        width: 15
      }

    ];

    result.rows.forEach((row) => {
      worksheet.addRow(row);
    });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );

    res.setHeader(
      'Content-Disposition',
      `attachment; filename=data-fab-${tanggal_awal}-sd-${tanggal_akhir}.xlsx`
    );

    await workbook.xlsx.write(res);

    res.end();

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: err.message
    });

  }

});

module.exports = router;