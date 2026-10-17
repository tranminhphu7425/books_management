import json
import os

class StarUMLERDBuilder:
    def __init__(self, project_name="BooksManagement_System_ERD"):
        self.counter = 2000
        self.project_id = self.gen_id()
        self.data_model_id = self.gen_id()
        self.diagram_id = self.gen_id()
        self.project_name = project_name
        
        self.entities = {}         # name -> entity_dict
        self.entity_views = {}     # name -> view_dict
        self.relationships = []    # list of rel_dict
        self.relationship_views = [] # list of rel_view_dict
        
    def gen_id(self):
        self.counter += 1
        return f"AAAAAAG{self.counter:09d}_ERD="

    def add_entity(self, name, columns, left, top, width, height):
        ent_id = self.gen_id()
        col_models = []
        col_views = []
        
        comp_view_id = self.gen_id()
        view_id = self.gen_id()
        name_label_id = self.gen_id()

        for idx, col in enumerate(columns):
            c_id = self.gen_id()
            c_model = {
                "_type": "ERDColumn",
                "_id": c_id,
                "_parent": {"$ref": ent_id},
                "name": col["name"],
                "type": col.get("type", "VARCHAR(50)"),
                "length": col.get("length", 0),
                "primaryKey": col.get("pk", False),
                "foreignKey": col.get("fk", False),
                "nullable": col.get("nullable", True),
                "unique": col.get("unique", False)
            }
            col_models.append(c_model)
            
            cv_id = self.gen_id()
            c_view = {
                "_type": "ERDColumnView",
                "_id": cv_id,
                "_parent": {"$ref": comp_view_id},
                "model": {"$ref": c_id},
                "font": "Arial;12;0",
                "left": left + 5,
                "top": top + 26 + (idx * 16),
                "width": width - 10,
                "height": 13
            }
            col_views.append(c_view)

        ent_model = {
            "_type": "ERDEntity",
            "_id": ent_id,
            "_parent": {"$ref": self.data_model_id},
            "name": name,
            "columns": col_models,
            "ownedElements": []
        }

        ent_view = {
            "_type": "ERDEntityView",
            "_id": view_id,
            "_parent": {"$ref": self.diagram_id},
            "model": {"$ref": ent_id},
            "subViews": [
                {
                    "_type": "LabelView",
                    "_id": name_label_id,
                    "_parent": {"$ref": view_id},
                    "font": "Arial;13;1",
                    "left": left + 5,
                    "top": top + 5,
                    "width": width - 10,
                    "height": 14,
                    "text": name
                },
                {
                    "_type": "ERDColumnCompartmentView",
                    "_id": comp_view_id,
                    "_parent": {"$ref": view_id},
                    "model": {"$ref": ent_id},
                    "subViews": col_views,
                    "font": "Arial;12;0",
                    "left": left,
                    "top": top + 24,
                    "width": width,
                    "height": height - 24
                }
            ],
            "font": "Arial;12;0",
            "left": left,
            "top": top,
            "width": width,
            "height": height,
            "nameLabel": {"$ref": name_label_id},
            "columnCompartment": {"$ref": comp_view_id}
        }

        self.entities[name] = ent_model
        self.entity_views[name] = ent_view
        return ent_model, ent_view

    def add_relationship(self, name, ent1_name, ent2_name, card1="1", card2="0..*", points=None, identifying=False):
        ent1 = self.entities[ent1_name]
        ent2 = self.entities[ent2_name]
        v1 = self.entity_views[ent1_name]
        v2 = self.entity_views[ent2_name]
        
        rel_id = self.gen_id()
        end1_id = self.gen_id()
        end2_id = self.gen_id()
        
        rel_model = {
            "_type": "ERDRelationship",
            "_id": rel_id,
            "_parent": {"$ref": ent1["_id"]},
            "name": name,
            "end1": {
                "_type": "ERDRelationshipEnd",
                "_id": end1_id,
                "_parent": {"$ref": rel_id},
                "reference": {"$ref": ent1["_id"]},
                "cardinality": card1
            },
            "end2": {
                "_type": "ERDRelationshipEnd",
                "_id": end2_id,
                "_parent": {"$ref": rel_id},
                "reference": {"$ref": ent2["_id"]},
                "cardinality": card2,
                "identifying": identifying
            }
        }
        ent1["ownedElements"].append(rel_model)
        self.relationships.append(rel_model)

        # Calculate default points if not provided
        if not points:
            cx1 = v1["left"] + v1["width"] // 2
            cy1 = v1["top"] + v1["height"] // 2
            cx2 = v2["left"] + v2["width"] // 2
            cy2 = v2["top"] + v2["height"] // 2
            points_str = f"{cx1}:{cy1};{cx2}:{cy2}"
            mid_x = (cx1 + cx2) // 2
            mid_y = (cy1 + cy2) // 2
        else:
            points_str = ";".join([f"{pt[0]}:{pt[1]}" for pt in points])
            mid_pt = points[len(points) // 2]
            mid_x, mid_y = mid_pt[0], mid_pt[1]

        rel_view_id = self.gen_id()
        name_lbl_id = self.gen_id()
        tail_lbl_id = self.gen_id()
        head_lbl_id = self.gen_id()

        rel_view = {
            "_type": "ERDRelationshipView",
            "_id": rel_view_id,
            "_parent": {"$ref": self.diagram_id},
            "model": {"$ref": rel_id},
            "tail": {"$ref": v1["_id"]},
            "head": {"$ref": v2["_id"]},
            "lineStyle": 2, # Orthogonal
            "points": points_str,
            "nameLabel": {
                "_type": "EdgeLabelView",
                "_id": name_lbl_id,
                "_parent": {"$ref": rel_view_id},
                "model": {"$ref": rel_id},
                "visible": bool(name),
                "font": "Arial;11;0",
                "left": mid_x + 5,
                "top": mid_y - 15,
                "width": len(name) * 7 if name else 0,
                "height": 13,
                "text": name,
                "alpha": 1.5707963267948966,
                "distance": 15
            },
            "tailNameLabel": {
                "_type": "EdgeLabelView",
                "_id": tail_lbl_id,
                "_parent": {"$ref": rel_view_id},
                "model": {"$ref": end1_id},
                "visible": False,
                "font": "Arial;11;0",
                "left": v1["left"] + 10,
                "top": v1["top"] + 10,
                "width": 10,
                "height": 13
            },
            "headNameLabel": {
                "_type": "EdgeLabelView",
                "_id": head_lbl_id,
                "_parent": {"$ref": rel_view_id},
                "model": {"$ref": end2_id},
                "visible": False,
                "font": "Arial;11;0",
                "left": v2["left"] + 10,
                "top": v2["top"] + 10,
                "width": 10,
                "height": 13
            }
        }
        self.relationship_views.append(rel_view)
        return rel_model, rel_view

    def build_project(self):
        views = list(self.entity_views.values()) + self.relationship_views
        models = list(self.entities.values())

        diagram = {
            "_type": "ERDDiagram",
            "_id": self.diagram_id,
            "_parent": {"$ref": self.data_model_id},
            "name": "Sơ đồ Thực thể Quan hệ (ERD) - Hệ thống Quản lý sách",
            "ownedViews": views
        }

        data_model = {
            "_type": "ERDDataModel",
            "_id": self.data_model_id,
            "_parent": {"$ref": self.project_id},
            "name": "HeThongQuanLySach_DataModel",
            "ownedElements": [diagram] + models
        }

        project = {
            "_type": "Project",
            "_id": self.project_id,
            "name": self.project_name,
            "ownedElements": [data_model]
        }
        return project

def generate_books_management_erd():
    builder = StarUMLERDBuilder("BooksManagement_System_ERD")

    # 1. TheLoai (Category)
    cols_theloai = [
        {"name": "_id", "type": "VARCHAR(24)", "pk": True, "nullable": False, "unique": True},
        {"name": "MaTheLoai", "type": "VARCHAR(50)", "pk": False, "nullable": False, "unique": True},
        {"name": "TenTheLoai", "type": "VARCHAR(150)", "pk": False, "nullable": False, "unique": True},
        {"name": "MoTa", "type": "TEXT", "pk": False, "nullable": True},
        {"name": "TrangThai", "type": "VARCHAR(20)", "pk": False, "nullable": False},
        {"name": "createdAt", "type": "TIMESTAMP", "pk": False, "nullable": False},
        {"name": "updatedAt", "type": "TIMESTAMP", "pk": False, "nullable": False}
    ]
    builder.add_entity("TheLoai", cols_theloai, left=60, top=80, width=280, height=155)

    # 2. NhaXuatBan (Publisher)
    cols_nxb = [
        {"name": "_id", "type": "VARCHAR(24)", "pk": True, "nullable": False, "unique": True},
        {"name": "MaNXB", "type": "VARCHAR(50)", "pk": False, "nullable": False, "unique": True},
        {"name": "TenNXB", "type": "VARCHAR(255)", "pk": False, "nullable": False},
        {"name": "DiaChi", "type": "TEXT", "pk": False, "nullable": True},
        {"name": "DienThoai", "type": "VARCHAR(20)", "pk": False, "nullable": True},
        {"name": "Email", "type": "VARCHAR(255)", "pk": False, "nullable": True},
        {"name": "createdAt", "type": "TIMESTAMP", "pk": False, "nullable": False},
        {"name": "updatedAt", "type": "TIMESTAMP", "pk": False, "nullable": False}
    ]
    builder.add_entity("NhaXuatBan", cols_nxb, left=60, top=280, width=280, height=170)

    # 3. CauHinhHeThong (System Settings)
    cols_cauhinh = [
        {"name": "_id", "type": "VARCHAR(24)", "pk": True, "nullable": False, "unique": True},
        {"name": "KhoaCauHinh", "type": "VARCHAR(100)", "pk": False, "nullable": False, "unique": True},
        {"name": "SoSachMuonToiDa", "type": "INT", "pk": False, "nullable": False},
        {"name": "SoNgayMuonToiDa", "type": "INT", "pk": False, "nullable": False},
        {"name": "ThoiGianGiuSachGio", "type": "INT", "pk": False, "nullable": False},
        {"name": "HanTraGiaHanNgay", "type": "INT", "pk": False, "nullable": False},
        {"name": "SoLanGiaHanToiDa", "type": "INT", "pk": False, "nullable": False},
        {"name": "SoNgayTreHanVaoDanhSachDen", "type": "INT", "pk": False, "nullable": False},
        {"name": "createdAt", "type": "TIMESTAMP", "pk": False, "nullable": False},
        {"name": "updatedAt", "type": "TIMESTAMP", "pk": False, "nullable": False}
    ]
    builder.add_entity("CauHinhHeThong", cols_cauhinh, left=60, top=500, width=310, height=205)

    # 4. Sach (Book)
    cols_sach = [
        {"name": "_id", "type": "VARCHAR(24)", "pk": True, "nullable": False, "unique": True},
        {"name": "MaSach", "type": "VARCHAR(50)", "pk": False, "nullable": False, "unique": True},
        {"name": "TenSach", "type": "VARCHAR(255)", "pk": False, "nullable": False},
        {"name": "DonGia", "type": "DECIMAL(12,2)", "pk": False, "nullable": False},
        {"name": "SoQuyen", "type": "INT", "pk": False, "nullable": False},
        {"name": "NamXuatBan", "type": "INT", "pk": False, "nullable": False},
        {"name": "MaNXB", "type": "VARCHAR(50)", "fk": True, "nullable": False},
        {"name": "TacGia", "type": "VARCHAR(255)", "pk": False, "nullable": False},
        {"name": "NguonGoc", "type": "VARCHAR(255)", "pk": False, "nullable": True},
        {"name": "NhaXuatBanId", "type": "VARCHAR(24)", "fk": True, "nullable": True},
        {"name": "MaTheLoai", "type": "VARCHAR(50)", "fk": True, "nullable": True},
        {"name": "TheLoai", "type": "VARCHAR(100)", "pk": False, "nullable": True},
        {"name": "ISBN", "type": "VARCHAR(50)", "pk": False, "nullable": True, "unique": True},
        {"name": "HinhAnh", "type": "VARCHAR(500)", "pk": False, "nullable": True},
        {"name": "MoTa", "type": "TEXT", "pk": False, "nullable": True},
        {"name": "ViTri", "type": "VARCHAR(100)", "pk": False, "nullable": True},
        {"name": "SoQuyenKhaDung", "type": "INT", "pk": False, "nullable": False},
        {"name": "SoQuyenDangMuon", "type": "INT", "pk": False, "nullable": False},
        {"name": "SoQuyenHuHong", "type": "INT", "pk": False, "nullable": False},
        {"name": "TrangThai", "type": "VARCHAR(20)", "pk": False, "nullable": False},
        {"name": "createdAt", "type": "TIMESTAMP", "pk": False, "nullable": False},
        {"name": "updatedAt", "type": "TIMESTAMP", "pk": False, "nullable": False}
    ]
    builder.add_entity("Sach", cols_sach, left=440, top=100, width=330, height=395)

    # 5. TheoDoiMuonSach (Borrow Ticket)
    cols_muon = [
        {"name": "_id", "type": "VARCHAR(24)", "pk": True, "nullable": False, "unique": True},
        {"name": "MaDocGia", "type": "VARCHAR(50)", "fk": True, "nullable": False},
        {"name": "MaSach", "type": "VARCHAR(50)", "fk": True, "nullable": False},
        {"name": "NgayMuon", "type": "TIMESTAMP", "pk": False, "nullable": True},
        {"name": "NgayTra", "type": "TIMESTAMP", "pk": False, "nullable": True},
        {"name": "DocGiaId", "type": "VARCHAR(24)", "fk": True, "nullable": False},
        {"name": "SachId", "type": "VARCHAR(24)", "fk": True, "nullable": False},
        {"name": "TrangThai", "type": "VARCHAR(20)", "pk": False, "nullable": False},
        {"name": "NgayYeuCau", "type": "TIMESTAMP", "pk": False, "nullable": False},
        {"name": "NgayHenLay", "type": "TIMESTAMP", "pk": False, "nullable": True},
        {"name": "HanChotNhan", "type": "TIMESTAMP", "pk": False, "nullable": True},
        {"name": "HanTra", "type": "TIMESTAMP", "pk": False, "nullable": True},
        {"name": "SoLanGiaHan", "type": "INT", "pk": False, "nullable": False},
        {"name": "MSNVDuyet", "type": "VARCHAR(50)", "fk": True, "nullable": True},
        {"name": "NhanVienDuyetId", "type": "VARCHAR(24)", "fk": True, "nullable": True},
        {"name": "GhiChu", "type": "TEXT", "pk": False, "nullable": True},
        {"name": "createdAt", "type": "TIMESTAMP", "pk": False, "nullable": False},
        {"name": "updatedAt", "type": "TIMESTAMP", "pk": False, "nullable": False}
    ]
    builder.add_entity("TheoDoiMuonSach", cols_muon, left=880, top=100, width=330, height=335)

    # 6. BienBanBoiThuong (Fine / Incident Report)
    cols_bienban = [
        {"name": "_id", "type": "VARCHAR(24)", "pk": True, "nullable": False, "unique": True},
        {"name": "MaBienBan", "type": "VARCHAR(50)", "pk": False, "nullable": False, "unique": True},
        {"name": "MaTheoDoiMuon", "type": "VARCHAR(50)", "fk": True, "nullable": True},
        {"name": "TheoDoiMuonId", "type": "VARCHAR(24)", "fk": True, "nullable": False},
        {"name": "MaDocGia", "type": "VARCHAR(50)", "fk": True, "nullable": True},
        {"name": "DocGiaId", "type": "VARCHAR(24)", "fk": True, "nullable": False},
        {"name": "MaSach", "type": "VARCHAR(50)", "fk": True, "nullable": True},
        {"name": "SachId", "type": "VARCHAR(24)", "fk": True, "nullable": False},
        {"name": "LoaiSuCo", "type": "VARCHAR(20)", "pk": False, "nullable": False},
        {"name": "MoTa", "type": "TEXT", "pk": False, "nullable": False},
        {"name": "SoTienBoiThuong", "type": "DECIMAL(12,2)", "pk": False, "nullable": False},
        {"name": "TrangThai", "type": "VARCHAR(20)", "pk": False, "nullable": False},
        {"name": "NgayLap", "type": "TIMESTAMP", "pk": False, "nullable": False},
        {"name": "NgayGiaiQuyet", "type": "TIMESTAMP", "pk": False, "nullable": True},
        {"name": "MSNVThuTien", "type": "VARCHAR(50)", "fk": True, "nullable": True},
        {"name": "NhanVienThuTienId", "type": "VARCHAR(24)", "fk": True, "nullable": True},
        {"name": "GhiChu", "type": "TEXT", "pk": False, "nullable": True},
        {"name": "createdAt", "type": "TIMESTAMP", "pk": False, "nullable": False},
        {"name": "updatedAt", "type": "TIMESTAMP", "pk": False, "nullable": False}
    ]
    builder.add_entity("BienBanBoiThuong", cols_bienban, left=1320, top=100, width=330, height=335)

    # 7. DocGia (Reader)
    cols_docgia = [
        {"name": "_id", "type": "VARCHAR(24)", "pk": True, "nullable": False, "unique": True},
        {"name": "MaDocGia", "type": "VARCHAR(50)", "pk": False, "nullable": False, "unique": True},
        {"name": "HoLot", "type": "VARCHAR(150)", "pk": False, "nullable": False},
        {"name": "Ten", "type": "VARCHAR(100)", "pk": False, "nullable": False},
        {"name": "NgaySinh", "type": "DATE", "pk": False, "nullable": True},
        {"name": "Phai", "type": "VARCHAR(10)", "pk": False, "nullable": False},
        {"name": "DiaChi", "type": "TEXT", "pk": False, "nullable": True},
        {"name": "DienThoai", "type": "VARCHAR(20)", "pk": False, "nullable": True},
        {"name": "Email", "type": "VARCHAR(255)", "pk": False, "nullable": False, "unique": True},
        {"name": "Password", "type": "VARCHAR(255)", "pk": False, "nullable": True},
        {"name": "HinhAnh", "type": "VARCHAR(500)", "pk": False, "nullable": True},
        {"name": "GoogleId", "type": "VARCHAR(255)", "pk": False, "nullable": True},
        {"name": "DaBiKhoa", "type": "BOOLEAN", "pk": False, "nullable": False},
        {"name": "LyDoKhoa", "type": "TEXT", "pk": False, "nullable": True},
        {"name": "NgayKhoa", "type": "TIMESTAMP", "pk": False, "nullable": True},
        {"name": "createdAt", "type": "TIMESTAMP", "pk": False, "nullable": False},
        {"name": "updatedAt", "type": "TIMESTAMP", "pk": False, "nullable": False}
    ]
    builder.add_entity("DocGia", cols_docgia, left=880, top=500, width=310, height=320)

    # 8. NhanVien (Staff / Admin)
    cols_nhanvien = [
        {"name": "_id", "type": "VARCHAR(24)", "pk": True, "nullable": False, "unique": True},
        {"name": "MSNV", "type": "VARCHAR(50)", "pk": False, "nullable": False, "unique": True},
        {"name": "HoTenNV", "type": "VARCHAR(150)", "pk": False, "nullable": False},
        {"name": "Password", "type": "VARCHAR(255)", "pk": False, "nullable": False},
        {"name": "ChucVu", "type": "VARCHAR(50)", "pk": False, "nullable": False},
        {"name": "DiaChi", "type": "TEXT", "pk": False, "nullable": True},
        {"name": "SoDienThoai", "type": "VARCHAR(20)", "pk": False, "nullable": True},
        {"name": "Email", "type": "VARCHAR(255)", "pk": False, "nullable": False, "unique": True},
        {"name": "HinhAnh", "type": "VARCHAR(500)", "pk": False, "nullable": True},
        {"name": "createdAt", "type": "TIMESTAMP", "pk": False, "nullable": False},
        {"name": "updatedAt", "type": "TIMESTAMP", "pk": False, "nullable": False}
    ]
    builder.add_entity("NhanVien", cols_nhanvien, left=1320, top=500, width=290, height=220)

    # 9. NhatKyHoatDong (Audit Trail)
    cols_nhatky = [
        {"name": "_id", "type": "VARCHAR(24)", "pk": True, "nullable": False, "unique": True},
        {"name": "ThoiGian", "type": "TIMESTAMP", "pk": False, "nullable": False},
        {"name": "HanhDong", "type": "VARCHAR(50)", "pk": False, "nullable": False},
        {"name": "NhanVienId", "type": "VARCHAR(24)", "fk": True, "nullable": True},
        {"name": "MSNV", "type": "VARCHAR(50)", "fk": True, "nullable": True},
        {"name": "HoTenNhanVien", "type": "VARCHAR(150)", "pk": False, "nullable": True},
        {"name": "ChucVuNhanVien", "type": "VARCHAR(50)", "pk": False, "nullable": True},
        {"name": "DiaChiIP", "type": "VARCHAR(45)", "pk": False, "nullable": True},
        {"name": "UserAgent", "type": "TEXT", "pk": False, "nullable": True},
        {"name": "TenCollection", "type": "VARCHAR(100)", "pk": False, "nullable": True},
        {"name": "DocumentId", "type": "VARCHAR(24)", "pk": False, "nullable": True},
        {"name": "MaDinhDanhDoiTuong", "type": "VARCHAR(100)", "pk": False, "nullable": True},
        {"name": "ChiTiet", "type": "TEXT", "pk": False, "nullable": False},
        {"name": "DuLieuCu", "type": "JSON", "pk": False, "nullable": True},
        {"name": "DuLieuMoi", "type": "JSON", "pk": False, "nullable": True},
        {"name": "createdAt", "type": "TIMESTAMP", "pk": False, "nullable": False}
    ]
    builder.add_entity("NhatKyHoatDong", cols_nhatky, left=1720, top=400, width=320, height=300)

    # --- Relationships ---
    # 1. TheLoai (1) -> (0..*) Sach
    builder.add_relationship(
        name="thuoc_the_loai",
        ent1_name="TheLoai",
        ent2_name="Sach",
        card1="1",
        card2="0..*",
        points=[(340, 150), (440, 150)]
    )

    # 2. NhaXuatBan (1) -> (0..*) Sach
    builder.add_relationship(
        name="xuat_ban_an_pham",
        ent1_name="NhaXuatBan",
        ent2_name="Sach",
        card1="1",
        card2="0..*",
        points=[(340, 360), (440, 360)]
    )

    # 3. Sach (1) -> (0..*) TheoDoiMuonSach
    builder.add_relationship(
        name="duoc_muon",
        ent1_name="Sach",
        ent2_name="TheoDoiMuonSach",
        card1="1",
        card2="0..*",
        points=[(770, 240), (880, 240)]
    )

    # 4. DocGia (1) -> (0..*) TheoDoiMuonSach
    builder.add_relationship(
        name="dang_ky_muon",
        ent1_name="DocGia",
        ent2_name="TheoDoiMuonSach",
        card1="1",
        card2="0..*",
        points=[(980, 500), (980, 435)]
    )

    # 5. NhanVien (0..1) -> (0..*) TheoDoiMuonSach
    builder.add_relationship(
        name="duyet_va_xuat_sach",
        ent1_name="NhanVien",
        ent2_name="TheoDoiMuonSach",
        card1="0..1",
        card2="0..*",
        points=[(1320, 550), (1240, 550), (1240, 380), (1210, 380)]
    )

    # 6. TheoDoiMuonSach (1) -> (0..1) BienBanBoiThuong
    builder.add_relationship(
        name="phat_sinh_su_co",
        ent1_name="TheoDoiMuonSach",
        ent2_name="BienBanBoiThuong",
        card1="1",
        card2="0..1",
        points=[(1210, 220), (1320, 220)]
    )

    # 7. DocGia (1) -> (0..*) BienBanBoiThuong
    builder.add_relationship(
        name="boi_thuong_vi_pham",
        ent1_name="DocGia",
        ent2_name="BienBanBoiThuong",
        card1="1",
        card2="0..*",
        points=[(1190, 600), (1270, 600), (1270, 350), (1320, 350)]
    )

    # 8. Sach (1) -> (0..*) BienBanBoiThuong
    builder.add_relationship(
        name="sach_bi_su_co",
        ent1_name="Sach",
        ent2_name="BienBanBoiThuong",
        card1="1",
        card2="0..*",
        points=[(600, 100), (600, 40), (1480, 40), (1480, 100)]
    )

    # 9. NhanVien (0..1) -> (0..*) BienBanBoiThuong
    builder.add_relationship(
        name="thu_tien_boi_thuong",
        ent1_name="NhanVien",
        ent2_name="BienBanBoiThuong",
        card1="0..1",
        card2="0..*",
        points=[(1450, 500), (1450, 435)]
    )

    # 10. NhanVien (0..1) -> (0..*) NhatKyHoatDong
    builder.add_relationship(
        name="ghi_nhan_tac_nghiep",
        ent1_name="NhanVien",
        ent2_name="NhatKyHoatDong",
        card1="0..1",
        card2="0..*",
        points=[(1610, 580), (1720, 580)]
    )

    project_data = builder.build_project()
    out_path = os.path.join(os.path.dirname(__file__), "books_management_erd.mdj")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(project_data, f, ensure_ascii=False, indent=2)
    print(f"[SUCCESS] Da tao thanh cong file So do Thuc the Quan he (ERD): {out_path}")

if __name__ == "__main__":
    generate_books_management_erd()
