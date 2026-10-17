import json
import os

class StarUMLProjectBuilder:
    def __init__(self, project_name="BooksManagement_System_UML"):
        self.counter = 1000
        self.project_id = self.gen_id()
        self.model_id = self.gen_id()
        self.project_name = project_name
        self.elements = []
        
    def gen_id(self):
        self.counter += 1
        return f"AAAAAAG{self.counter:09d}_BM="
        
    def create_use_case_model(self, name, parent_id):
        m_id = self.gen_id()
        return {
            "_type": "UMLUseCase",
            "_id": m_id,
            "_parent": {"$ref": parent_id},
            "name": name
        }

    def create_actor_model(self, name, parent_id):
        m_id = self.gen_id()
        return {
            "_type": "UMLActor",
            "_id": m_id,
            "_parent": {"$ref": parent_id},
            "name": name
        }

    def create_subject_model(self, name, parent_id):
        m_id = self.gen_id()
        return {
            "_type": "UMLUseCaseSubject",
            "_id": m_id,
            "_parent": {"$ref": parent_id},
            "name": name
        }

    def create_association_model(self, name, parent_id, end1_ref, end2_ref):
        m_id = self.gen_id()
        e1_id = self.gen_id()
        e2_id = self.gen_id()
        return {
            "_type": "UMLAssociation",
            "_id": m_id,
            "_parent": {"$ref": parent_id},
            "name": name,
            "end1": {
                "_type": "UMLAssociationEnd",
                "_id": e1_id,
                "_parent": {"$ref": m_id},
                "reference": {"$ref": end1_ref}
            },
            "end2": {
                "_type": "UMLAssociationEnd",
                "_id": e2_id,
                "_parent": {"$ref": m_id},
                "reference": {"$ref": end2_ref}
            }
        }

    def create_include_model(self, parent_id, source_ref, target_ref):
        m_id = self.gen_id()
        return {
            "_type": "UMLInclude",
            "_id": m_id,
            "_parent": {"$ref": parent_id},
            "source": {"$ref": source_ref},
            "target": {"$ref": target_ref}
        }

    def create_extend_model(self, parent_id, source_ref, target_ref):
        m_id = self.gen_id()
        return {
            "_type": "UMLExtend",
            "_id": m_id,
            "_parent": {"$ref": parent_id},
            "source": {"$ref": source_ref},
            "target": {"$ref": target_ref}
        }

    # View Builders
    def create_subject_view(self, model, diag_id, left, top, width, height):
        v_id = self.gen_id()
        nc_id = self.gen_id()
        l1 = self.gen_id()
        l2 = self.gen_id()
        l3 = self.gen_id()
        return {
            "_type": "UMLUseCaseSubjectView",
            "_id": v_id,
            "_parent": {"$ref": diag_id},
            "model": {"$ref": model["_id"]},
            "subViews": [
                {
                    "_type": "UMLNameCompartmentView",
                    "_id": nc_id,
                    "_parent": {"$ref": v_id},
                    "model": {"$ref": model["_id"]},
                    "subViews": [
                        {"_type": "LabelView", "_id": l1, "_parent": {"$ref": nc_id}, "visible": False, "font": "Arial;13;0", "left": 0, "top": 0, "width": 0, "height": 13},
                        {"_type": "LabelView", "_id": l2, "_parent": {"$ref": nc_id}, "font": "Arial;13;1", "left": left + 10, "top": top + 7, "width": width - 20, "height": 13, "text": model["name"]},
                        {"_type": "LabelView", "_id": l3, "_parent": {"$ref": nc_id}, "visible": False, "font": "Arial;13;0", "left": 0, "top": 0, "width": 0, "height": 13}
                    ],
                    "font": "Arial;13;0",
                    "left": left, "top": top, "width": width, "height": 25,
                    "nameLabel": {"$ref": l2}
                }
            ],
            "font": "Arial;13;0",
            "left": left, "top": top, "width": width, "height": height,
            "nameCompartment": {"$ref": nc_id}
        }

    def create_actor_view(self, model, diag_id, left, top, width=50, height=70):
        v_id = self.gen_id()
        nc_id = self.gen_id()
        l1 = self.gen_id()
        l2 = self.gen_id()
        l3 = self.gen_id()
        return {
            "_type": "UMLActorView",
            "_id": v_id,
            "_parent": {"$ref": diag_id},
            "model": {"$ref": model["_id"]},
            "subViews": [
                {
                    "_type": "UMLNameCompartmentView",
                    "_id": nc_id,
                    "_parent": {"$ref": v_id},
                    "model": {"$ref": model["_id"]},
                    "subViews": [
                        {"_type": "LabelView", "_id": l1, "_parent": {"$ref": nc_id}, "visible": False, "font": "Arial;13;0", "left": 0, "top": 0, "width": 0, "height": 13},
                        {"_type": "LabelView", "_id": l2, "_parent": {"$ref": nc_id}, "font": "Arial;13;1", "left": left - 40, "top": top + height + 5, "width": width + 80, "height": 13, "text": model["name"]},
                        {"_type": "LabelView", "_id": l3, "_parent": {"$ref": nc_id}, "visible": False, "font": "Arial;13;0", "left": 0, "top": 0, "width": 0, "height": 13}
                    ],
                    "font": "Arial;13;0",
                    "left": left - 40, "top": top + height + 5, "width": width + 80, "height": 25,
                    "nameLabel": {"$ref": l2}
                },
                {"_type": "UMLAttributeCompartmentView", "_id": self.gen_id(), "_parent": {"$ref": v_id}, "model": {"$ref": model["_id"]}, "visible": False, "font": "Arial;13;0", "width": 10, "height": 10},
                {"_type": "UMLOperationCompartmentView", "_id": self.gen_id(), "_parent": {"$ref": v_id}, "model": {"$ref": model["_id"]}, "visible": False, "font": "Arial;13;0", "width": 10, "height": 10},
                {"_type": "UMLReceptionCompartmentView", "_id": self.gen_id(), "_parent": {"$ref": v_id}, "model": {"$ref": model["_id"]}, "visible": False, "font": "Arial;13;0", "width": 10, "height": 10},
                {"_type": "UMLTemplateParameterCompartmentView", "_id": self.gen_id(), "_parent": {"$ref": v_id}, "model": {"$ref": model["_id"]}, "visible": False, "font": "Arial;13;0", "width": 10, "height": 10}
            ],
            "font": "Arial;13;0",
            "left": left, "top": top, "width": width, "height": height,
            "nameCompartment": {"$ref": nc_id},
            "suppressAttributes": True,
            "suppressOperations": True,
            "suppressReceptions": True
        }

    def create_use_case_view(self, model, diag_id, left, top, width=220, height=55):
        v_id = self.gen_id()
        nc_id = self.gen_id()
        l1 = self.gen_id()
        l2 = self.gen_id()
        l3 = self.gen_id()
        return {
            "_type": "UMLUseCaseView",
            "_id": v_id,
            "_parent": {"$ref": diag_id},
            "model": {"$ref": model["_id"]},
            "subViews": [
                {
                    "_type": "UMLNameCompartmentView",
                    "_id": nc_id,
                    "_parent": {"$ref": v_id},
                    "model": {"$ref": model["_id"]},
                    "subViews": [
                        {"_type": "LabelView", "_id": l1, "_parent": {"$ref": nc_id}, "visible": False, "font": "Arial;13;0", "left": 0, "top": 0, "width": 0, "height": 13},
                        {"_type": "LabelView", "_id": l2, "_parent": {"$ref": nc_id}, "font": "Arial;13;1", "left": left + 10, "top": top + (height - 13)//2, "width": width - 20, "height": 13, "text": model["name"]},
                        {"_type": "LabelView", "_id": l3, "_parent": {"$ref": nc_id}, "visible": False, "font": "Arial;13;0", "left": 0, "top": 0, "width": 0, "height": 13}
                    ],
                    "font": "Arial;13;0",
                    "left": left + 5, "top": top + (height - 23)//2, "width": width - 10, "height": 23,
                    "nameLabel": {"$ref": l2}
                },
                {"_type": "UMLAttributeCompartmentView", "_id": self.gen_id(), "_parent": {"$ref": v_id}, "model": {"$ref": model["_id"]}, "visible": False, "font": "Arial;13;0", "width": 10, "height": 10},
                {"_type": "UMLOperationCompartmentView", "_id": self.gen_id(), "_parent": {"$ref": v_id}, "model": {"$ref": model["_id"]}, "visible": False, "font": "Arial;13;0", "width": 10, "height": 10},
                {"_type": "UMLReceptionCompartmentView", "_id": self.gen_id(), "_parent": {"$ref": v_id}, "model": {"$ref": model["_id"]}, "visible": False, "font": "Arial;13;0", "width": 10, "height": 10},
                {"_type": "UMLTemplateParameterCompartmentView", "_id": self.gen_id(), "_parent": {"$ref": v_id}, "model": {"$ref": model["_id"]}, "visible": False, "font": "Arial;13;0", "width": 10, "height": 10},
                {"_type": "UMLExtensionPointCompartmentView", "_id": self.gen_id(), "_parent": {"$ref": v_id}, "model": {"$ref": model["_id"]}, "visible": False, "font": "Arial;13;0", "width": 10, "height": 10}
            ],
            "font": "Arial;13;0",
            "left": left, "top": top, "width": width, "height": height,
            "nameCompartment": {"$ref": nc_id}
        }

    def calc_points(self, v1, v2):
        c1x = v1["left"] + v1["width"] // 2
        c1y = v1["top"] + v1["height"] // 2
        c2x = v2["left"] + v2["width"] // 2
        c2y = v2["top"] + v2["height"] // 2
        
        # approximate edge intersection
        if c1x < c2x:
            p1x = v1["left"] + v1["width"]
            p2x = v2["left"]
        else:
            p1x = v1["left"]
            p2x = v2["left"] + v2["width"]
        p1y = c1y
        p2y = c2y
        return f"{p1x}:{p1y};{p2x}:{p2y}", (p1x+p2x)//2, (p1y+p2y)//2

    def create_association_view(self, model, diag_id, tail_view, head_view):
        v_id = self.gen_id()
        pts, mx, my = self.calc_points(tail_view, head_view)
        return {
            "_type": "UMLAssociationView",
            "_id": v_id,
            "_parent": {"$ref": diag_id},
            "model": {"$ref": model["_id"]},
            "subViews": [
                {"_type": "EdgeLabelView", "_id": self.gen_id(), "_parent": {"$ref": v_id}, "model": {"$ref": model["_id"]}, "visible": False, "font": "Arial;13;0", "left": mx, "top": my, "height": 13},
                {"_type": "EdgeLabelView", "_id": self.gen_id(), "_parent": {"$ref": v_id}, "model": {"$ref": model["end1"]["_id"]}, "visible": False, "font": "Arial;13;0", "left": tail_view["left"], "top": tail_view["top"], "height": 13},
                {"_type": "EdgeLabelView", "_id": self.gen_id(), "_parent": {"$ref": v_id}, "model": {"$ref": model["end2"]["_id"]}, "visible": False, "font": "Arial;13;0", "left": head_view["left"], "top": head_view["top"], "height": 13}
            ],
            "font": "Arial;13;0",
            "head": {"$ref": head_view["_id"]},
            "tail": {"$ref": tail_view["_id"]},
            "lineStyle": 1,
            "points": pts
        }

    def create_include_view(self, model, diag_id, source_view, target_view):
        v_id = self.gen_id()
        pts, mx, my = self.calc_points(source_view, target_view)
        lbl_id = self.gen_id()
        return {
            "_type": "UMLIncludeView",
            "_id": v_id,
            "_parent": {"$ref": diag_id},
            "model": {"$ref": model["_id"]},
            "subViews": [
                {
                    "_type": "EdgeLabelView",
                    "_id": lbl_id,
                    "_parent": {"$ref": v_id},
                    "model": {"$ref": model["_id"]},
                    "font": "Arial;13;0",
                    "left": mx - 25,
                    "top": my - 15,
                    "width": 55,
                    "height": 13,
                    "text": "«include»"
                }
            ],
            "font": "Arial;13;0",
            "head": {"$ref": target_view["_id"]},
            "tail": {"$ref": source_view["_id"]},
            "lineStyle": 1,
            "points": pts
        }

    def create_extend_view(self, model, diag_id, source_view, target_view):
        v_id = self.gen_id()
        pts, mx, my = self.calc_points(source_view, target_view)
        lbl_id = self.gen_id()
        return {
            "_type": "UMLExtendView",
            "_id": v_id,
            "_parent": {"$ref": diag_id},
            "model": {"$ref": model["_id"]},
            "subViews": [
                {
                    "_type": "EdgeLabelView",
                    "_id": lbl_id,
                    "_parent": {"$ref": v_id},
                    "model": {"$ref": model["_id"]},
                    "font": "Arial;13;0",
                    "left": mx - 25,
                    "top": my - 15,
                    "width": 55,
                    "height": 13,
                    "text": "«extend»"
                }
            ],
            "font": "Arial;13;0",
            "head": {"$ref": target_view["_id"]},
            "tail": {"$ref": source_view["_id"]},
            "lineStyle": 1,
            "points": pts
        }

def build_all_diagrams():
    builder = StarUMLProjectBuilder("BooksManagement_System_UML")
    model_elements = []
    
    # =========================================================================
    # DIAGRAM 1: Sơ đồ Use Case tổng quát (Overview)
    # =========================================================================
    d1_id = builder.gen_id()
    d1_views = []
    
    # Boundary
    d1_subj = builder.create_subject_model("Hệ thống Quản lý sách và Mượn trả trực tuyến", builder.model_id)
    model_elements.append(d1_subj)
    d1_subj_v = builder.create_subject_view(d1_subj, d1_id, 280, 50, 680, 840)
    d1_views.append(d1_subj_v)
    
    # Actors
    d1_act_guest = builder.create_actor_model("Khách vãng lai", builder.model_id)
    d1_act_user = builder.create_actor_model("Độc giả (User)", builder.model_id)
    d1_act_admin = builder.create_actor_model("Quản trị viên / Thủ thư", builder.model_id)
    model_elements.extend([d1_act_guest, d1_act_user, d1_act_admin])
    
    d1_act_guest_v = builder.create_actor_view(d1_act_guest, d1_id, 80, 160)
    d1_act_user_v = builder.create_actor_view(d1_act_user, d1_id, 80, 380)
    d1_act_admin_v = builder.create_actor_view(d1_act_admin, d1_id, 1020, 480)
    d1_views.extend([d1_act_guest_v, d1_act_user_v, d1_act_admin_v])
    
    # Use cases
    d1_ucs_def = [
        ("UC1: Đăng ký tài khoản", 330, 100, 240, 55),
        ("UC2: Đăng nhập hệ thống", 330, 180, 240, 55),
        ("UC3: Tra cứu & Tìm kiếm sách", 330, 260, 240, 55),
        ("UC4: Đăng ký mượn sách", 330, 340, 240, 55),
        ("UC5: Theo dõi mượn trả & Gia hạn", 330, 420, 240, 55),
        ("UC6: Quản lý kho ấn phẩm & NXB", 660, 420, 260, 55),
        ("UC7: Duyệt đơn & Xuất sách Check-out", 660, 500, 260, 55),
        ("UC8: Nhận trả sách & Lập biên bản", 660, 580, 260, 55),
        ("UC9: Quản lý độc giả & Blacklist", 660, 660, 260, 55),
        ("UC10: Bảng điều khiển thống kê", 660, 740, 260, 55),
    ]
    
    d1_uc_models = []
    d1_uc_views = []
    for name, left, top, width, height in d1_ucs_def:
        m = builder.create_use_case_model(name, builder.model_id)
        v = builder.create_use_case_view(m, d1_id, left, top, width, height)
        model_elements.append(m)
        d1_views.append(v)
        d1_uc_models.append(m)
        d1_uc_views.append(v)
        
    # Associations for Diagram 1
    # Guest -> UC1, UC2, UC3
    for idx in [0, 1, 2]:
        assoc = builder.create_association_model("", builder.model_id, d1_act_guest["_id"], d1_uc_models[idx]["_id"])
        model_elements.append(assoc)
        d1_views.append(builder.create_association_view(assoc, d1_id, d1_act_guest_v, d1_uc_views[idx]))
        
    # User -> UC2, UC3, UC4, UC5
    for idx in [1, 2, 3, 4]:
        assoc = builder.create_association_model("", builder.model_id, d1_act_user["_id"], d1_uc_models[idx]["_id"])
        model_elements.append(assoc)
        d1_views.append(builder.create_association_view(assoc, d1_id, d1_act_user_v, d1_uc_views[idx]))
        
    # Admin -> UC2, UC6, UC7, UC8, UC9, UC10
    for idx in [1, 5, 6, 7, 8, 9]:
        assoc = builder.create_association_model("", builder.model_id, d1_act_admin["_id"], d1_uc_models[idx]["_id"])
        model_elements.append(assoc)
        d1_views.append(builder.create_association_view(assoc, d1_id, d1_act_admin_v, d1_uc_views[idx]))
        
    d1_diag = {
        "_type": "UMLUseCaseDiagram",
        "_id": d1_id,
        "_parent": {"$ref": builder.model_id},
        "name": "1. Sơ đồ Use Case tổng quát",
        "ownedViews": d1_views
    }
    model_elements.append(d1_diag)

    # =========================================================================
    # DIAGRAM 2: Phân rã nhóm Xác thực & Tài khoản
    # =========================================================================
    d2_id = builder.gen_id()
    d2_views = []
    
    d2_subj = builder.create_subject_model("Phân hệ Xác thực & Tài khoản", builder.model_id)
    model_elements.append(d2_subj)
    d2_views.append(builder.create_subject_view(d2_subj, d2_id, 280, 60, 680, 650))
    
    d2_guest = builder.create_actor_model("Khách vãng lai", builder.model_id)
    d2_user = builder.create_actor_model("Người dùng (Độc giả / Thủ thư)", builder.model_id)
    model_elements.extend([d2_guest, d2_user])
    d2_guest_v = builder.create_actor_view(d2_guest, d2_id, 70, 130)
    d2_user_v = builder.create_actor_view(d2_user, d2_id, 70, 380)
    d2_views.extend([d2_guest_v, d2_user_v])
    
    # UCs: Register, Login, PassLogin, GoogleLogin, Logout, Profile, ChangePwd
    m_reg = builder.create_use_case_model("Đăng ký tài khoản độc giả", builder.model_id)
    m_login = builder.create_use_case_model("Đăng nhập hệ thống", builder.model_id)
    m_pass = builder.create_use_case_model("Đăng nhập bằng Mật khẩu", builder.model_id)
    m_google = builder.create_use_case_model("Đăng nhập bằng Google OAuth", builder.model_id)
    m_logout = builder.create_use_case_model("Đăng xuất", builder.model_id)
    m_profile = builder.create_use_case_model("Xem & Sửa hồ sơ cá nhân", builder.model_id)
    m_pwd = builder.create_use_case_model("Đổi mật khẩu tài khoản", builder.model_id)
    model_elements.extend([m_reg, m_login, m_pass, m_google, m_logout, m_profile, m_pwd])
    
    v_reg = builder.create_use_case_view(m_reg, d2_id, 340, 110, 230, 55)
    v_login = builder.create_use_case_view(m_login, d2_id, 340, 270, 210, 55)
    v_pass = builder.create_use_case_view(m_pass, d2_id, 680, 220, 230, 50)
    v_google = builder.create_use_case_view(m_google, d2_id, 680, 310, 240, 50)
    v_logout = builder.create_use_case_view(m_logout, d2_id, 340, 390, 190, 50)
    v_profile = builder.create_use_case_view(m_profile, d2_id, 340, 480, 230, 55)
    v_pwd = builder.create_use_case_view(m_pwd, d2_id, 340, 580, 230, 55)
    d2_views.extend([v_reg, v_login, v_pass, v_google, v_logout, v_profile, v_pwd])
    
    # Assocs
    a1 = builder.create_association_model("", builder.model_id, d2_guest["_id"], m_reg["_id"])
    a2 = builder.create_association_model("", builder.model_id, d2_user["_id"], m_login["_id"])
    a3 = builder.create_association_model("", builder.model_id, d2_user["_id"], m_logout["_id"])
    a4 = builder.create_association_model("", builder.model_id, d2_user["_id"], m_profile["_id"])
    a5 = builder.create_association_model("", builder.model_id, d2_user["_id"], m_pwd["_id"])
    model_elements.extend([a1, a2, a3, a4, a5])
    d2_views.append(builder.create_association_view(a1, d2_id, d2_guest_v, v_reg))
    d2_views.append(builder.create_association_view(a2, d2_id, d2_user_v, v_login))
    d2_views.append(builder.create_association_view(a3, d2_id, d2_user_v, v_logout))
    d2_views.append(builder.create_association_view(a4, d2_id, d2_user_v, v_profile))
    d2_views.append(builder.create_association_view(a5, d2_id, d2_user_v, v_pwd))
    
    # Extends & Includes
    ext1 = builder.create_extend_model(builder.model_id, m_pass["_id"], m_login["_id"])
    ext2 = builder.create_extend_model(builder.model_id, m_google["_id"], m_login["_id"])
    inc1 = builder.create_include_model(builder.model_id, m_profile["_id"], m_login["_id"])
    inc2 = builder.create_include_model(builder.model_id, m_pwd["_id"], m_login["_id"])
    model_elements.extend([ext1, ext2, inc1, inc2])
    d2_views.append(builder.create_extend_view(ext1, d2_id, v_pass, v_login))
    d2_views.append(builder.create_extend_view(ext2, d2_id, v_google, v_login))
    d2_views.append(builder.create_include_view(inc1, d2_id, v_profile, v_login))
    d2_views.append(builder.create_include_view(inc2, d2_id, v_pwd, v_login))
    
    d2_diag = {
        "_type": "UMLUseCaseDiagram",
        "_id": d2_id,
        "_parent": {"$ref": builder.model_id},
        "name": "2. Sơ đồ Use Case nhóm Xác thực & Tài khoản",
        "ownedViews": d2_views
    }
    model_elements.append(d2_diag)

    # =========================================================================
    # DIAGRAM 3: Phân rã phân hệ Độc giả (User Portal)
    # =========================================================================
    d3_id = builder.gen_id()
    d3_views = []
    
    d3_subj = builder.create_subject_model("Phân hệ Độc giả (User Portal)", builder.model_id)
    model_elements.append(d3_subj)
    d3_views.append(builder.create_subject_view(d3_subj, d3_id, 260, 60, 690, 670))
    
    d3_user = builder.create_actor_model("Độc giả (User)", builder.model_id)
    model_elements.append(d3_user)
    d3_user_v = builder.create_actor_view(d3_user, d3_id, 70, 330)
    d3_views.append(d3_user_v)
    
    m_search = builder.create_use_case_model("Tra cứu & Lọc ấn phẩm", builder.model_id)
    m_detail = builder.create_use_case_model("Xem chi tiết ấn phẩm", builder.model_id)
    m_borrow = builder.create_use_case_model("Đăng ký mượn sách", builder.model_id)
    m_hist = builder.create_use_case_model("Theo dõi lịch sử mượn trả", builder.model_id)
    m_ext = builder.create_use_case_model("Gia hạn đơn mượn", builder.model_id)
    m_cancel = builder.create_use_case_model("Hủy yêu cầu mượn PENDING", builder.model_id)
    m_inc = builder.create_use_case_model("Xem biên bản sự cố cá nhân", builder.model_id)
    model_elements.extend([m_search, m_detail, m_borrow, m_hist, m_ext, m_cancel, m_inc])
    
    v_search = builder.create_use_case_view(m_search, d3_id, 320, 110, 220, 55)
    v_detail = builder.create_use_case_view(m_detail, d3_id, 660, 110, 220, 55)
    v_borrow = builder.create_use_case_view(m_borrow, d3_id, 320, 240, 220, 55)
    v_hist = builder.create_use_case_view(m_hist, d3_id, 320, 410, 230, 55)
    v_ext = builder.create_use_case_view(m_ext, d3_id, 670, 360, 200, 50)
    v_cancel = builder.create_use_case_view(m_cancel, d3_id, 670, 450, 220, 50)
    v_inc = builder.create_use_case_view(m_inc, d3_id, 320, 560, 230, 55)
    d3_views.extend([v_search, v_detail, v_borrow, v_hist, v_ext, v_cancel, v_inc])
    
    a_u1 = builder.create_association_model("", builder.model_id, d3_user["_id"], m_search["_id"])
    a_u2 = builder.create_association_model("", builder.model_id, d3_user["_id"], m_borrow["_id"])
    a_u3 = builder.create_association_model("", builder.model_id, d3_user["_id"], m_hist["_id"])
    a_u4 = builder.create_association_model("", builder.model_id, d3_user["_id"], m_inc["_id"])
    model_elements.extend([a_u1, a_u2, a_u3, a_u4])
    d3_views.append(builder.create_association_view(a_u1, d3_id, d3_user_v, v_search))
    d3_views.append(builder.create_association_view(a_u2, d3_id, d3_user_v, v_borrow))
    d3_views.append(builder.create_association_view(a_u3, d3_id, d3_user_v, v_hist))
    d3_views.append(builder.create_association_view(a_u4, d3_id, d3_user_v, v_inc))
    
    e_det = builder.create_extend_model(builder.model_id, m_detail["_id"], m_search["_id"])
    i_bor = builder.create_include_model(builder.model_id, m_borrow["_id"], m_detail["_id"])
    e_ext = builder.create_extend_model(builder.model_id, m_ext["_id"], m_hist["_id"])
    e_can = builder.create_extend_model(builder.model_id, m_cancel["_id"], m_hist["_id"])
    model_elements.extend([e_det, i_bor, e_ext, e_can])
    d3_views.append(builder.create_extend_view(e_det, d3_id, v_detail, v_search))
    d3_views.append(builder.create_include_view(i_bor, d3_id, v_borrow, v_detail))
    d3_views.append(builder.create_extend_view(e_ext, d3_id, v_ext, v_hist))
    d3_views.append(builder.create_extend_view(e_can, d3_id, v_cancel, v_hist))
    
    d3_diag = {
        "_type": "UMLUseCaseDiagram",
        "_id": d3_id,
        "_parent": {"$ref": builder.model_id},
        "name": "3. Sơ đồ Use Case phân hệ Độc giả",
        "ownedViews": d3_views
    }
    model_elements.append(d3_diag)

    # =========================================================================
    # DIAGRAM 4: Phân rã Quản lý kho sách (Books & Publishers)
    # =========================================================================
    d4_id = builder.gen_id()
    d4_views = []
    
    d4_subj = builder.create_subject_model("Quản lý Kho sách & Nhà xuất bản", builder.model_id)
    model_elements.append(d4_subj)
    d4_views.append(builder.create_subject_view(d4_subj, d4_id, 280, 60, 680, 640))
    
    d4_bm = builder.create_actor_model("Quản lý kho sách (Book Manager)", builder.model_id)
    d4_adm = builder.create_actor_model("Quản trị viên (Admin)", builder.model_id)
    model_elements.extend([d4_bm, d4_adm])
    d4_bm_v = builder.create_actor_view(d4_bm, d4_id, 60, 220)
    d4_adm_v = builder.create_actor_view(d4_adm, d4_id, 60, 430)
    d4_views.extend([d4_bm_v, d4_adm_v])
    
    m_find = builder.create_use_case_model("Tìm kiếm & Lọc kho sách", builder.model_id)
    m_add = builder.create_use_case_model("Thêm sách mới", builder.model_id)
    m_edit = builder.create_use_case_model("Cập nhật thông tin sách", builder.model_id)
    m_del = builder.create_use_case_model("Xóa mềm sách lưu hành", builder.model_id)
    m_pub = builder.create_use_case_model("Quản lý Nhà xuất bản", builder.model_id)
    m_qpub = builder.create_use_case_model("Tạo nhanh NXB tại Form sách", builder.model_id)
    m_cat = builder.create_use_case_model("Quản lý Thể loại sách", builder.model_id)
    model_elements.extend([m_find, m_add, m_edit, m_del, m_pub, m_qpub, m_cat])
    
    v_find = builder.create_use_case_view(m_find, d4_id, 340, 100, 220, 55)
    v_add = builder.create_use_case_view(m_add, d4_id, 340, 200, 200, 55)
    v_edit = builder.create_use_case_view(m_edit, d4_id, 340, 300, 220, 55)
    v_del = builder.create_use_case_view(m_del, d4_id, 340, 400, 220, 55)
    v_pub = builder.create_use_case_view(m_pub, d4_id, 680, 200, 220, 55)
    v_qpub = builder.create_use_case_view(m_qpub, d4_id, 680, 300, 230, 50)
    v_cat = builder.create_use_case_view(m_cat, d4_id, 340, 500, 220, 55)
    d4_views.extend([v_find, v_add, v_edit, v_del, v_pub, v_qpub, v_cat])
    
    # Book Manager assocs
    for uc_m, uc_v in [(m_find, v_find), (m_add, v_add), (m_edit, v_edit), (m_del, v_del), (m_cat, v_cat)]:
        a = builder.create_association_model("", builder.model_id, d4_bm["_id"], uc_m["_id"])
        model_elements.append(a)
        d4_views.append(builder.create_association_view(a, d4_id, d4_bm_v, uc_v))
        
    # Admin assocs
    for uc_m, uc_v in [(m_find, v_find), (m_add, v_add), (m_edit, v_edit), (m_del, v_del), (m_pub, v_pub), (m_cat, v_cat)]:
        a = builder.create_association_model("", builder.model_id, d4_adm["_id"], uc_m["_id"])
        model_elements.append(a)
        d4_views.append(builder.create_association_view(a, d4_id, d4_adm_v, uc_v))
        
    inc_pub = builder.create_include_model(builder.model_id, m_add["_id"], m_pub["_id"])
    ext_qpub = builder.create_extend_model(builder.model_id, m_qpub["_id"], m_add["_id"])
    model_elements.extend([inc_pub, ext_qpub])
    d4_views.append(builder.create_include_view(inc_pub, d4_id, v_add, v_pub))
    d4_views.append(builder.create_extend_view(ext_qpub, d4_id, v_qpub, v_add))
    
    d4_diag = {
        "_type": "UMLUseCaseDiagram",
        "_id": d4_id,
        "_parent": {"$ref": builder.model_id},
        "name": "4. Sơ đồ Use Case phân rã Quản lý kho sách",
        "ownedViews": d4_views
    }
    model_elements.append(d4_diag)

    # =========================================================================
    # DIAGRAM 5: Phân rã Xử lý Mượn - Trả sách
    # =========================================================================
    d5_id = builder.gen_id()
    d5_views = []
    
    d5_subj = builder.create_subject_model("Xử lý Lưu thông Mượn - Trả sách", builder.model_id)
    model_elements.append(d5_subj)
    d5_views.append(builder.create_subject_view(d5_subj, d5_id, 270, 60, 710, 640))
    
    d5_lib = builder.create_actor_model("Thủ thư / Admin (Librarian)", builder.model_id)
    model_elements.append(d5_lib)
    d5_lib_v = builder.create_actor_view(d5_lib, d5_id, 70, 320)
    d5_views.append(d5_lib_v)
    
    m_queue = builder.create_use_case_model("Xem hàng đợi mượn PENDING", builder.model_id)
    m_appr = builder.create_use_case_model("Duyệt đơn hẹn mượn", builder.model_id)
    m_chkout = builder.create_use_case_model("Xuất sách tại quầy Check-out", builder.model_id)
    m_chkin = builder.create_use_case_model("Nhận trả sách tại quầy Check-in", builder.model_id)
    m_fine = builder.create_use_case_model("Lập biên bản sự cố bồi thường", builder.model_id)
    m_payfine = builder.create_use_case_model("Xác nhận thu tiền phạt đền bù", builder.model_id)
    m_over = builder.create_use_case_model("Đôn đốc sách quá hạn", builder.model_id)
    model_elements.extend([m_queue, m_appr, m_chkout, m_chkin, m_fine, m_payfine, m_over])
    
    v_queue = builder.create_use_case_view(m_queue, d5_id, 330, 110, 240, 55)
    v_appr = builder.create_use_case_view(m_appr, d5_id, 330, 210, 210, 55)
    v_chkout = builder.create_use_case_view(m_chkout, d5_id, 680, 210, 250, 55)
    v_chkin = builder.create_use_case_view(m_chkin, d5_id, 330, 350, 240, 55)
    v_fine = builder.create_use_case_view(m_fine, d5_id, 680, 350, 240, 55)
    v_payfine = builder.create_use_case_view(m_payfine, d5_id, 680, 460, 240, 55)
    v_over = builder.create_use_case_view(m_over, d5_id, 330, 500, 210, 55)
    d5_views.extend([v_queue, v_appr, v_chkout, v_chkin, v_fine, v_payfine, v_over])
    
    # Assocs
    for uc_m, uc_v in [(m_queue, v_queue), (m_appr, v_appr), (m_chkin, v_chkin), (m_over, v_over), (m_payfine, v_payfine)]:
        a = builder.create_association_model("", builder.model_id, d5_lib["_id"], uc_m["_id"])
        model_elements.append(a)
        d5_views.append(builder.create_association_view(a, d5_id, d5_lib_v, uc_v))
        
    inc_chkout = builder.create_include_model(builder.model_id, m_chkout["_id"], m_appr["_id"])
    ext_fine = builder.create_extend_model(builder.model_id, m_fine["_id"], m_chkin["_id"])
    inc_payfine = builder.create_include_model(builder.model_id, m_payfine["_id"], m_fine["_id"])
    model_elements.extend([inc_chkout, ext_fine, inc_payfine])
    d5_views.append(builder.create_include_view(inc_chkout, d5_id, v_chkout, v_appr))
    d5_views.append(builder.create_extend_view(ext_fine, d5_id, v_fine, v_chkin))
    d5_views.append(builder.create_include_view(inc_payfine, d5_id, v_payfine, v_fine))
    
    d5_diag = {
        "_type": "UMLUseCaseDiagram",
        "_id": d5_id,
        "_parent": {"$ref": builder.model_id},
        "name": "5. Sơ đồ Use Case phân rã Xử lý Mượn - Trả sách",
        "ownedViews": d5_views
    }
    model_elements.append(d5_diag)

    # =========================================================================
    # DIAGRAM 6: Phân rã Quản lý người dùng và Blacklist
    # =========================================================================
    d6_id = builder.gen_id()
    d6_views = []
    
    d6_subj = builder.create_subject_model("Quản lý Người dùng & Vi phạm", builder.model_id)
    model_elements.append(d6_subj)
    d6_views.append(builder.create_subject_view(d6_subj, d6_id, 270, 60, 690, 620))
    
    d6_adm = builder.create_actor_model("Quản trị viên (Admin)", builder.model_id)
    model_elements.append(d6_adm)
    d6_adm_v = builder.create_actor_view(d6_adm, d6_id, 70, 310)
    d6_views.append(d6_adm_v)
    
    m_ulist = builder.create_use_case_model("Xem danh sách độc giả", builder.model_id)
    m_lock = builder.create_use_case_model("Khóa quyền mượn Blacklist", builder.model_id)
    m_unlock = builder.create_use_case_model("Mở khóa quyền mượn", builder.model_id)
    m_role = builder.create_use_case_model("Phân quyền nhân viên", builder.model_id)
    m_dash = builder.create_use_case_model("Bảng điều khiển thống kê", builder.model_id)
    m_audit = builder.create_use_case_model("Truy vết nhật ký tác nghiệp", builder.model_id)
    model_elements.extend([m_ulist, m_lock, m_unlock, m_role, m_dash, m_audit])
    
    v_ulist = builder.create_use_case_view(m_ulist, d6_id, 330, 130, 220, 55)
    v_lock = builder.create_use_case_view(m_lock, d6_id, 680, 100, 230, 50)
    v_unlock = builder.create_use_case_view(m_unlock, d6_id, 680, 180, 210, 50)
    v_role = builder.create_use_case_view(m_role, d6_id, 330, 250, 210, 55)
    v_dash = builder.create_use_case_view(m_dash, d6_id, 330, 380, 230, 55)
    v_audit = builder.create_use_case_view(m_audit, d6_id, 330, 500, 240, 55)
    d6_views.extend([v_ulist, v_lock, v_unlock, v_role, v_dash, v_audit])
    
    for uc_m, uc_v in [(m_ulist, v_ulist), (m_role, v_role), (m_dash, v_dash), (m_audit, v_audit)]:
        a = builder.create_association_model("", builder.model_id, d6_adm["_id"], uc_m["_id"])
        model_elements.append(a)
        d6_views.append(builder.create_association_view(a, d6_id, d6_adm_v, uc_v))
        
    ext_lock = builder.create_extend_model(builder.model_id, m_lock["_id"], m_ulist["_id"])
    ext_unlock = builder.create_extend_model(builder.model_id, m_unlock["_id"], m_ulist["_id"])
    model_elements.extend([ext_lock, ext_unlock])
    d6_views.append(builder.create_extend_view(ext_lock, d6_id, v_lock, v_ulist))
    d6_views.append(builder.create_extend_view(ext_unlock, d6_id, v_unlock, v_ulist))
    
    d6_diag = {
        "_type": "UMLUseCaseDiagram",
        "_id": d6_id,
        "_parent": {"$ref": builder.model_id},
        "name": "6. Sơ đồ Use Case Quản lý người dùng và Blacklist",
        "ownedViews": d6_views
    }
    model_elements.append(d6_diag)

    # Root Project JSON
    root = {
        "_type": "Project",
        "_id": builder.project_id,
        "name": builder.project_name,
        "ownedElements": [
            {
                "_type": "UMLModel",
                "_id": builder.model_id,
                "_parent": {"$ref": builder.project_id},
                "name": "HeThongQuanLySach_UseCaseModels",
                "ownedElements": model_elements
            }
        ],
        "documentVersion": 1
    }
    
    output_path = r"d:\Documents\GitHub\books_management\books_management_usecase.mdj"
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(root, f, ensure_ascii=False, indent=2)
    print(f"Successfully generated StarUML file with 6 diagrams at: {output_path}")

if __name__ == "__main__":
    build_all_diagrams()
