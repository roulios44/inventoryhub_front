<template>
<div class="card" style="width: 18rem;">
  <div class="card-body">
    <h5 class="card-title">Register</h5>
    <div class="tab-content">
      <div class="tab-pane fade show active" id="pills-login" role="tabpanel" aria-labelledby="tab-login">
          <div data-mdb-input-init class="form-outline mb-4">
            <input type="email" id="loginName" class="form-control" v-model="email"/>
            <label class="form-label" for="loginName">Email</label>
          </div>

          <div data-mdb-input-init class="form-outline mb-4">
            <input type="password" id="loginPassword" class="form-control" v-model="password" />
            <label class="form-label" for="loginPassword">Password</label>
            <input type="password" id="loginPassword" class="form-control" v-model="confirmPassword" />
            <label class="form-label" for="loginPassword">Confirm password</label>
          </div>

            <div class="col-md-6 d-flex justify-content-center">
              <a href="/login">Already a account ?</a>
            </div>
          </div>

          <button type="submit" data-mdb-button-init data-mdb-ripple-init class="btn btn-primary btn-block mb-4">Register</button>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        password : null,
        confirmPassword : null,
        email : null,
      };
    },
    methods: {
    }
  };
</script>