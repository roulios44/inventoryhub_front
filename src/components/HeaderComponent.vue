<template>
    <nav class="navbar navbar-expand-lg bg-light">
    <div class="container-fluid">
      <a class='navbar-brand' href='/'>LOGO</a>
      <button aria-controls='navbarSupportedContent' aria-expanded='true' aria-label='Toggle navigation' class='navbar-toggler' data-bs-target='#navbarSupportedContent' data-bs-toggle='collapse' type='button'>
          <span class='navbar-toggler-icon'></span>
      </button>
      <div class='collapse navbar-collapse' id='navbarSupportedContent'>
        <ul class='navbar-nav me-auto mb-2 mb-lg-0'>
          <li class='nav-item'><a aria-current='page' class='nav-link active' href='/'>Home</a></li>
          <li class='nav-item'><a class='nav-link' href='#'>Link</a></li>
          <li class='nav-item dropdown'><a aria-expanded='true' class='nav-link dropdown-toggle' data-bs-toggle='dropdown' href='#' role='button'>Dropdown</a>
            <ul class='dropdown-menu'>
              <li><a class='dropdown-item' href='#'>Action</a></li>
              <li><a class='dropdown-item' href='#'>Another action</a></li>
              <li><a class='dropdown-item' href='#'>Something else here</a></li>
            </ul>
          </li>
        </ul>

      </div>
    </div>
  </nav>
</template>
  
  <script>
  export default {
    data() {
      return {
      };
    },
    methods: {
    }
  };
  </script>
  
  <style>
  </style>